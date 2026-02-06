import { isAxiosError } from 'axios'
import { DigiflazzService } from './digiflazz.service'
import type { Cookie, Product, ProductCategory, Seller } from './digiflazz.type'

export type UpdateMode = 'seller' | 'price-only'

export type AutoFillProductCodeConfig =
  | boolean
  | {
      enabled: boolean
      prefix?: string
      length?: number
    }

export type MaxPriceConfig = {
  mode: 'same' | 'markup'
  markup: {
    amount: number
    perCode: Record<string, number>
  }
}

export type PerProductConfig = {
  updateMode?: UpdateMode
  preferredSellers?: string[]
  allowedSellerSkuCodes?: string[]
}

export type SellerFilterConfig = {
  minRating: number
  minRatingSteps?: number[]
  blacklist: string[]
  requireActive: boolean
  enforceMaxPrice: boolean
}

export type DigiflazzUpdateConfig = {
  cookies: Cookie[]
  categories?: string[]
  subCategoryTypeIds?: string[]
  excludeProductCodes?: string[]
  updateMode?: UpdateMode
  perProduct?: Record<string, PerProductConfig>
  autoFillProductCode?: AutoFillProductCodeConfig
  maxPrice?: MaxPriceConfig
  onlyProblematic?: boolean
  problematicCriteria?: {
    inactiveSeller: boolean
    priceOverMax: boolean
  }
  sellerFilter?: SellerFilterConfig
  requestDelayMs?: number
  logger?: Partial<UpdateLogger>
}

export type UpdateLogger = {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  success: (message: string) => void
  muted: (message: string) => void
}

export type UpdateErrorDetail = {
  message: string
  status?: number
  data?: unknown
}

export type UpdateReportItem = {
  productId: string
  productName: string
  previousSeller?: string
  previousPrice?: number
  nextSeller?: string
  nextPrice?: number
  maxPriceBefore?: number
  maxPriceAfter?: number
  codeBefore?: string
  codeAfter?: string
  status: 'updated' | 'skipped' | 'error'
  reason?: string
}

export type BrandUpdateReport = {
  categoryId: string
  categoryName: string
  brandId: string
  brandName: string
  selectors: {
    categories: string[]
    subcategories: string[]
  }
  stats: {
    totalProducts: number
    problematic: number
    updated: number
    skippedNotProblematic: number
    skippedNoSeller: number
  }
  items: UpdateReportItem[]
  errors: UpdateErrorDetail[]
  updateMessage?: string
  failedSample?: Array<{
    productId: string
    code: string
    price: number
    max_price: number
    seller: string
    seller_sku_id: string
  }>
  updatedAt: string
}

const defaultLogger: UpdateLogger = {
  info: (message) => console.log(`[info] ${message}`),
  warn: (message) => console.log(`[warn] ${message}`),
  error: (message) => console.log(`[error] ${message}`),
  success: (message) => console.log(`[ok] ${message}`),
  muted: (message) => console.log(`[...] ${message}`),
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const matchesSelector = (selectors: string[], value: string, name?: string) => {
  if (selectors.length === 0 || selectors.includes('all')) {
    return true
  }

  const normalized = selectors.map((selector) => selector.toLowerCase())
  const valueMatch = normalized.includes(value.toLowerCase())
  const nameMatch = name ? normalized.includes(name.toLowerCase()) : false
  return valueMatch || nameMatch
}

const extractErrorDetail = (error: unknown): UpdateErrorDetail => {
  if (isAxiosError(error)) {
    return {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: String(error) }
}

const extractErrorMessages = (detail: UpdateErrorDetail) => {
  const data = detail.data
  if (!data || typeof data !== 'object') {
    return []
  }

  const errors = (data as { errors?: unknown }).errors
  if (Array.isArray(errors)) {
    return errors.filter((item) => typeof item === 'string') as string[]
  }

  return []
}

const normalizeConfigKey = (value: string) => value.toLowerCase()

const buildPerProductConfigMap = (perProduct: Record<string, PerProductConfig>) => {
  const entries = Object.entries(perProduct)
  return new Map(entries.map(([key, value]) => [normalizeConfigKey(key), value]))
}

const getPerProductConfig = (map: Map<string, PerProductConfig>, product: ProductCategory) => {
  const codeKey = product.code ? normalizeConfigKey(product.code) : ''
  return codeKey ? map.get(codeKey) : undefined
}

const isProblematic = (
  product: ProductCategory,
  onlyProblematic: boolean,
  criteria: { inactiveSeller: boolean; priceOverMax: boolean },
) => {
  if (!onlyProblematic) {
    return true
  }

  const checks: boolean[] = []

  if (criteria.inactiveSeller) {
    checks.push(!product.status || product.status_sellerSku === 0)
  }

  if (criteria.priceOverMax) {
    checks.push(product.price > product.max_price)
  }

  return checks.some(Boolean)
}

const isSellerAllowed = (
  seller: Seller,
  product: ProductCategory,
  minRating: number,
  filter: SellerFilterConfig,
) => {
  if (filter.requireActive && (!seller.status || seller.status_sellerSku === 0)) {
    return false
  }

  if (minRating > 0 && seller.reviewAvg < minRating) {
    return false
  }

  if (
    filter.blacklist.length > 0 &&
    filter.blacklist.some((blocked) => blocked.toLowerCase() === seller.seller.toLowerCase())
  ) {
    return false
  }

  if (filter.enforceMaxPrice && seller.price > product.max_price) {
    return false
  }

  return true
}

const pickBestSeller = (
  product: ProductCategory,
  sellers: Seller[],
  filter: SellerFilterConfig,
  perProduct?: PerProductConfig,
) => {
  const ratingSteps = filter.minRatingSteps?.length
    ? [...filter.minRatingSteps]
    : [filter.minRating]
  const allowedSku = perProduct?.allowedSellerSkuCodes?.map((code) => code.toLowerCase()) ?? []

  for (const minRating of ratingSteps) {
    const candidates = sellers.filter((seller) => {
      if (allowedSku.length > 0 && !allowedSku.includes(seller.seller_sku_code.toLowerCase())) {
        return false
      }
      return isSellerAllowed(seller, product, minRating, filter)
    })

    if (candidates.length === 0) {
      continue
    }

    if (perProduct?.preferredSellers?.length) {
      for (const name of perProduct.preferredSellers) {
        const match = candidates.find(
          (seller) => seller.seller.toLowerCase() === name.toLowerCase(),
        )
        if (match) {
          return match
        }
      }
    }

    return candidates.sort((left, right) => left.price - right.price)[0]
  }

  return null
}

const pickCurrentSeller = (
  product: ProductCategory,
  sellers: Seller[],
  perProduct?: PerProductConfig,
) => {
  const allowedSku = perProduct?.allowedSellerSkuCodes?.map((code) => code.toLowerCase()) ?? []
  const candidates = sellers.filter((seller) => {
    if (allowedSku.length > 0 && !allowedSku.includes(seller.seller_sku_code.toLowerCase())) {
      return false
    }
    return true
  })

  const bySkuCode = candidates.find((seller) => seller.seller_sku_code === product.seller_sku_code)
  if (bySkuCode) {
    return bySkuCode
  }

  const byName = candidates.find((seller) => seller.seller === product.seller)
  if (byName) {
    return byName
  }

  return null
}

const ensureUniqueCode = (code: string, usedCodes: Set<string>) => {
  if (!usedCodes.has(code)) {
    usedCodes.add(code)
    return code
  }

  let candidate = code
  while (usedCodes.has(candidate)) {
    candidate = `${code}-${Math.random().toString(36).slice(2, 8)}`
  }
  usedCodes.add(candidate)
  return candidate
}

const resolveProductCode = (
  product: ProductCategory,
  seller: Seller,
  autoFillConfig: AutoFillProductCodeConfig,
  usedCodes: Set<string>,
) => {
  const autoFillEnabled =
    typeof autoFillConfig === 'boolean' ? autoFillConfig : Boolean(autoFillConfig?.enabled)

  const trimmed = product.code?.trim()
  if (trimmed) {
    return ensureUniqueCode(trimmed, usedCodes)
  }

  if (!autoFillEnabled) {
    return product.code
  }

  if (typeof autoFillConfig === 'object') {
    const prefix = autoFillConfig.prefix ?? 'BP'
    const length = autoFillConfig.length ?? 10
    const randomPart = Math.random().toString(36).slice(2)
    const candidate = `${prefix}${randomPart}`.slice(0, prefix.length + length)
    return ensureUniqueCode(candidate, usedCodes)
  }

  return ensureUniqueCode(seller.seller_sku_code || product.product_id, usedCodes)
}

const getMaxPrice = (price: number, code: string, maxPrice: MaxPriceConfig) => {
  if (maxPrice.mode === 'same') {
    return price
  }

  const perCode = maxPrice.markup.perCode[code]
  const markup = typeof perCode === 'number' ? perCode : maxPrice.markup.amount
  return price + markup
}

const applySellerToProduct = (
  product: ProductCategory,
  seller: Seller,
  autoFillConfig: AutoFillProductCodeConfig,
  maxPrice: MaxPriceConfig,
  usedCodes: Set<string>,
): Product => {
  const updatedCode = resolveProductCode(product, seller, autoFillConfig, usedCodes)
  const updatedMaxPrice = getMaxPrice(seller.price, updatedCode, maxPrice)
  return {
    ...product,
    code: updatedCode,
    max_price: updatedMaxPrice,
    price: seller.price,
    stock: seller.stock,
    start_cut_off: seller.start_cut_off,
    end_cut_off: seller.end_cut_off,
    faktur: seller.faktur,
    multi: seller.multi,
    multi_counter: seller.multi_counter,
    unlimited_stock: seller.unlimited_stock,
    seller: seller.seller,
    seller_sku_id: seller.id,
    seller_sku_id_int: seller.id_int,
    seller_sku_code: seller.seller_sku_code,
    seller_connection_type: seller.connectionType,
    seller_sku_desc: seller.deskripsi,
    status: seller.status,
    status_sellerSku: seller.status_sellerSku,
    isDuplicateCode: false,
    isDuplicateSeller: false,
  }
}

const applyPriceOnlyToProduct = (
  product: ProductCategory,
  seller: Seller,
  autoFillConfig: AutoFillProductCodeConfig,
  maxPrice: MaxPriceConfig,
  usedCodes: Set<string>,
): Product => {
  const updatedCode = resolveProductCode(product, seller, autoFillConfig, usedCodes)
  const updatedMaxPrice = getMaxPrice(seller.price, updatedCode, maxPrice)
  return {
    ...product,
    code: updatedCode,
    max_price: updatedMaxPrice,
    price: seller.price,
    isDuplicateCode: false,
    isDuplicateSeller: false,
  }
}

const normalizeConfig = (config: DigiflazzUpdateConfig) => {
  return {
    categories: config.categories ?? ['all'],
    subCategoryTypeIds: config.subCategoryTypeIds ?? ['all'],
    excludeProductCodes: config.excludeProductCodes ?? [],
    updateMode: config.updateMode ?? 'seller',
    perProduct: config.perProduct ?? {},
    autoFillProductCode: config.autoFillProductCode ?? true,
    maxPrice: config.maxPrice ?? {
      mode: 'markup',
      markup: { amount: 0, perCode: {} },
    },
    onlyProblematic: config.onlyProblematic ?? false,
    problematicCriteria: config.problematicCriteria ?? {
      inactiveSeller: false,
      priceOverMax: false,
    },
    sellerFilter: config.sellerFilter ?? {
      minRating: 0,
      minRatingSteps: [],
      blacklist: [],
      requireActive: true,
      enforceMaxPrice: false,
    },
    requestDelayMs: config.requestDelayMs ?? 1000,
  }
}

export const digiflazzTools = {
  update: async (config: DigiflazzUpdateConfig): Promise<BrandUpdateReport[]> => {
    const logger = { ...defaultLogger, ...config.logger }
    const normalized = normalizeConfig(config)
    const usedCodes = new Set<string>()
    const perProductMap = buildPerProductConfigMap(normalized.perProduct)

    const digiflazz = new DigiflazzService(config.cookies)
    await digiflazz.initialize()

    const categoryResponse = await digiflazz.getProductCategory()
    const brandResponse = await digiflazz.getProductBrand()
    const brandNameById = new Map(brandResponse.data.map((brand) => [brand.id, brand.name]))
    const categories = categoryResponse.data.filter((category) =>
      matchesSelector(normalized.categories, category.id, category.name),
    )

    if (categories.length === 0) {
      logger.warn('No categories matched the selectors.')
      return []
    }

    const reports: BrandUpdateReport[] = []
    const excludedCodes = normalized.excludeProductCodes.map((code) => code.toLowerCase())

    for (const category of categories) {
      logger.info(`Category ${category.name} (${category.id})`)
      try {
        await sleep(normalized.requestDelayMs)
        const detailResponse = await digiflazz.getProductCategoryDetail(category.id)
        const products = detailResponse.data.filter((product) =>
          matchesSelector(
            normalized.subCategoryTypeIds,
            product.product_details.brand.id,
            brandNameById.get(product.product_details.brand.id),
          ),
        )

        const brandsMap = new Map<string, { name: string; items: ProductCategory[] }>()
        for (const product of products) {
          if (product.code && excludedCodes.includes(product.code.toLowerCase())) {
            logger.muted(`Skip excluded product ${product.product} (${product.code})`)
            continue
          }

          const brandId = product.product_details.brand.id
          const brandName = brandNameById.get(brandId) ?? brandId
          if (!brandsMap.has(brandId)) {
            brandsMap.set(brandId, { name: brandName, items: [] })
          }
          brandsMap.get(brandId)?.items.push(product)
        }

        for (const [brandId, brandInfo] of brandsMap.entries()) {
          const report: BrandUpdateReport = {
            categoryId: category.id,
            categoryName: category.name,
            brandId,
            brandName: brandInfo.name,
            selectors: {
              categories: normalized.categories,
              subcategories: normalized.subCategoryTypeIds,
            },
            stats: {
              totalProducts: brandInfo.items.length,
              problematic: 0,
              updated: 0,
              skippedNotProblematic: 0,
              skippedNoSeller: 0,
            },
            items: [],
            errors: [],
            updatedAt: new Date().toISOString(),
          }

          logger.info(`Brand ${brandInfo.name} (${brandId})`)
          const updates: Product[] = []

          for (const product of brandInfo.items) {
            const perProductConfig = getPerProductConfig(perProductMap, product)
            const updateMode = perProductConfig?.updateMode ?? normalized.updateMode

            if (
              !isProblematic(product, normalized.onlyProblematic, normalized.problematicCriteria)
            ) {
              report.stats.skippedNotProblematic += 1
              report.items.push({
                productId: product.product_id,
                productName: product.product,
                previousSeller: product.seller,
                previousPrice: product.price,
                maxPriceBefore: product.max_price,
                maxPriceAfter: product.max_price,
                codeBefore: product.code,
                codeAfter: product.code,
                status: 'skipped',
                reason: 'not-problematic',
              })
              continue
            }

            report.stats.problematic += 1

            try {
              await sleep(normalized.requestDelayMs)
              const sellerResponse = await digiflazz.getProductSeller(product.id)

              if (updateMode === 'price-only') {
                const currentSeller = pickCurrentSeller(
                  product,
                  sellerResponse.data,
                  perProductConfig,
                )
                if (!currentSeller) {
                  report.stats.skippedNoSeller += 1
                  report.errors.push({ message: 'Seller tidak ditemukan' })
                  report.items.push({
                    productId: product.product_id,
                    productName: product.product,
                    previousSeller: product.seller,
                    previousPrice: product.price,
                    maxPriceBefore: product.max_price,
                    maxPriceAfter: product.max_price,
                    codeBefore: product.code,
                    codeAfter: product.code,
                    status: 'skipped',
                    reason: 'price-only-no-current-seller',
                  })
                  logger.warn(
                    `No current seller match for price-only ${product.product} (${product.product_id}).`,
                  )
                  continue
                }

                const updatedProduct = applyPriceOnlyToProduct(
                  product,
                  currentSeller,
                  normalized.autoFillProductCode,
                  normalized.maxPrice,
                  usedCodes,
                )
                updates.push(updatedProduct)
                logger.info(
                  `${product.product} (${product.product_id}) price-only seller ${currentSeller.seller} | price ${currentSeller.price}`,
                )
                report.items.push({
                  productId: product.product_id,
                  productName: product.product,
                  previousSeller: product.seller,
                  previousPrice: product.price,
                  nextSeller: product.seller,
                  nextPrice: currentSeller.price,
                  maxPriceBefore: product.max_price,
                  maxPriceAfter: updatedProduct.max_price,
                  codeBefore: product.code,
                  codeAfter: updatedProduct.code,
                  status: 'updated',
                  reason: 'price-only',
                })
                continue
              }

              const bestSeller = pickBestSeller(
                product,
                sellerResponse.data,
                normalized.sellerFilter,
                perProductConfig,
              )

              if (!bestSeller) {
                report.stats.skippedNoSeller += 1
                report.errors.push({ message: 'Seller tidak ditemukan' })
                report.items.push({
                  productId: product.product_id,
                  productName: product.product,
                  previousSeller: product.seller,
                  previousPrice: product.price,
                  maxPriceBefore: product.max_price,
                  maxPriceAfter: product.max_price,
                  codeBefore: product.code,
                  codeAfter: product.code,
                  status: 'skipped',
                  reason: 'seller-not-found',
                })
                logger.warn(`No eligible seller for ${product.product} (${product.product_id}).`)
                continue
              }

              const updatedProduct = applySellerToProduct(
                product,
                bestSeller,
                normalized.autoFillProductCode,
                normalized.maxPrice,
                usedCodes,
              )
              updates.push(updatedProduct)
              const sellerChanged = product.seller !== bestSeller.seller
              const sellerLabel = sellerChanged
                ? `seller ${product.seller || '-'} -> ${bestSeller.seller}`
                : `seller ${bestSeller.seller}`
              logger.info(
                `${product.product} (${product.product_id}) ${sellerLabel} | price ${bestSeller.price}`,
              )
              report.items.push({
                productId: product.product_id,
                productName: product.product,
                previousSeller: product.seller,
                previousPrice: product.price,
                nextSeller: bestSeller.seller,
                nextPrice: bestSeller.price,
                maxPriceBefore: product.max_price,
                maxPriceAfter: updatedProduct.max_price,
                codeBefore: product.code,
                codeAfter: updatedProduct.code,
                status: 'updated',
                reason: sellerChanged ? 'seller-changed' : 'seller-confirmed',
              })
            } catch (error) {
              const detail = extractErrorDetail(error)
              report.errors.push(detail)
              report.items.push({
                productId: product.product_id,
                productName: product.product,
                previousSeller: product.seller,
                previousPrice: product.price,
                maxPriceBefore: product.max_price,
                maxPriceAfter: product.max_price,
                codeBefore: product.code,
                codeAfter: product.code,
                status: 'error',
                reason: detail.message,
              })
              logger.error(
                `Seller lookup failed for ${product.product} (${product.product_id}): ${detail.message}`,
              )
            }
          }

          if (updates.length === 0) {
            logger.warn('No updates prepared for this brand.')
          } else {
            logger.info(
              `Prepared ${updates.length} update(s). Skipped: ${report.stats.skippedNotProblematic} not-problematic, ${report.stats.skippedNoSeller} no-seller.`,
            )
            try {
              await sleep(normalized.requestDelayMs)
              const updateResult = await digiflazz.updateMultiple({ products: updates })
              report.stats.updated = updates.length
              report.updateMessage = updateResult.message
              logger.success(`Update result: ${updateResult.message}`)
            } catch (error) {
              const detail = extractErrorDetail(error)
              report.errors.push(detail)
              report.failedSample = updates.slice(0, 3).map((item) => ({
                productId: item.product_id,
                code: item.code,
                price: item.price,
                max_price: item.max_price,
                seller: item.seller,
                seller_sku_id: item.seller_sku_id,
              }))
              logger.error(`Update multiple failed: ${detail.message}`)
              const errors = extractErrorMessages(detail)
              if (errors.length) {
                logger.error(`Update multiple errors: ${errors.join(' | ')}`)
              }
            }
          }

          reports.push(report)
        }
      } catch (error) {
        const detail = extractErrorDetail(error)
        logger.error(`Category ${category.name} failed: ${detail.message}`)
      }
    }

    return reports
  },
}
