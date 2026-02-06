import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isAxiosError } from 'axios'
import { DigiflazzService } from '../src'
import type { Cookie, Product, ProductCategory, Seller } from '../src/digiflazz.type'
import { syncConfig } from './update-products.config'

const ansi = {
  red: (value: string) => `\u001b[31m${value}\u001b[0m`,
  green: (value: string) => `\u001b[32m${value}\u001b[0m`,
  yellow: (value: string) => `\u001b[33m${value}\u001b[0m`,
  cyan: (value: string) => `\u001b[36m${value}\u001b[0m`,
  gray: (value: string) => `\u001b[90m${value}\u001b[0m`,
}

const log = {
  info: (message: string) => console.log(`${ansi.cyan('[info]')} ${message}`),
  warn: (message: string) => console.log(`${ansi.yellow('[warn]')} ${message}`),
  error: (message: string) => console.log(`${ansi.red('[error]')} ${message}`),
  success: (message: string) => console.log(`${ansi.green('[ok]')} ${message}`),
  muted: (message: string) => console.log(`${ansi.gray('[...]')} ${message}`),
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const extractErrorDetail = (error: unknown) => {
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

const extractErrorMessages = (detail: { data?: unknown }) => {
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

type ArgValue = string | boolean

const parseArgs = (argv: string[]) => {
  const args = new Map<string, ArgValue>()

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index]
    if (!raw.startsWith('--')) {
      continue
    }

    const token = raw.slice(2)
    if (token.includes('=')) {
      const [key, ...rest] = token.split('=')
      args.set(key, rest.join('='))
      continue
    }

    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      args.set(token, next)
      index += 1
      continue
    }

    args.set(token, true)
  }

  return args
}

const getCookies = async (cookiesPath: string) => {
  const cookiesRaw = await fs.readFile(cookiesPath, 'utf-8')
  return JSON.parse(cookiesRaw) as Cookie[]
}

const toSafeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')

const isSellerAllowed = (seller: Seller, product: ProductCategory, minRating: number) => {
  if (syncConfig.sellerFilter.requireActive && (!seller.status || seller.status_sellerSku === 0)) {
    return false
  }

  if (minRating > 0 && seller.reviewAvg < minRating) {
    return false
  }

  if (
    syncConfig.sellerFilter.blacklist.length > 0 &&
    syncConfig.sellerFilter.blacklist.some(
      (blocked) => blocked.toLowerCase() === seller.seller.toLowerCase(),
    )
  ) {
    return false
  }

  if (syncConfig.sellerFilter.enforceMaxPrice && seller.price > product.max_price) {
    return false
  }

  return true
}

const normalizeConfigKey = (value: string) => value.toLowerCase()

const buildPerProductConfigMap = () => {
  const entries = Object.entries(syncConfig.perProduct ?? {})
  return new Map(entries.map(([key, value]) => [normalizeConfigKey(key), value]))
}

const getPerProductConfig = (
  map: Map<
    string,
    {
      updateMode?: 'seller' | 'price-only'
      preferredSellers?: string[]
      allowedSellerSkuCodes?: string[]
    }
  >,
  product: ProductCategory,
) => {
  const codeKey = product.code ? normalizeConfigKey(product.code) : ''
  return codeKey ? map.get(codeKey) : undefined
}

const matchesSellerName = (seller: Seller, name: string) =>
  seller.seller.toLowerCase() === name.toLowerCase()

const pickBestSeller = (
  product: ProductCategory,
  sellers: Seller[],
  perProduct?: { preferredSellers?: string[]; allowedSellerSkuCodes?: string[] },
) => {
  const ratingSteps = syncConfig.sellerFilter.minRatingSteps.length
    ? [...syncConfig.sellerFilter.minRatingSteps]
    : [syncConfig.sellerFilter.minRating]
  const allowedSku = perProduct?.allowedSellerSkuCodes?.map((code) => code.toLowerCase()) ?? []

  for (const minRating of ratingSteps) {
    const candidates = sellers.filter((seller) => {
      if (allowedSku.length > 0 && !allowedSku.includes(seller.seller_sku_code.toLowerCase())) {
        return false
      }
      return isSellerAllowed(seller, product, minRating)
    })

    if (candidates.length === 0) {
      continue
    }

    if (perProduct?.preferredSellers?.length) {
      for (const name of perProduct.preferredSellers) {
        const match = candidates.find((seller) => matchesSellerName(seller, name))
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
  perProduct?: { allowedSellerSkuCodes?: string[] },
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

const usedCodes = new Set<string>()

const ensureUniqueCode = (code: string) => {
  if (!usedCodes.has(code)) {
    usedCodes.add(code)
    return code
  }

  let candidate = code
  while (usedCodes.has(candidate)) {
    candidate = `${code}-${randomUUID().replace(/-/g, '').slice(0, 6)}`
  }
  usedCodes.add(candidate)
  return candidate
}

const resolveProductCode = (product: ProductCategory, seller: Seller) => {
  const rawConfig = syncConfig.autoFillProductCode
  const autoFillEnabled = typeof rawConfig === 'boolean' ? rawConfig : Boolean(rawConfig?.enabled)

  const trimmed = product.code?.trim()
  if (trimmed) {
    return ensureUniqueCode(trimmed)
  }

  if (!autoFillEnabled) {
    return product.code
  }

  if (typeof rawConfig === 'object') {
    const prefix = rawConfig.prefix ?? 'BP'
    const length = rawConfig.length ?? 10
    const randomPart = randomUUID().replace(/-/g, '').slice(0, Math.max(6, length))
    return ensureUniqueCode(`${prefix}${randomPart}`)
  }

  return ensureUniqueCode(seller.seller_sku_code || product.product_id)
}

const getMaxPrice = (_product: ProductCategory, price: number, code: string) => {
  if (syncConfig.maxPrice.mode === 'same') {
    return price
  }

  const perCode = syncConfig.maxPrice.markup.perCode[code]
  const markup = typeof perCode === 'number' ? perCode : syncConfig.maxPrice.markup.amount
  return price + markup
}

const applySellerToProduct = (product: ProductCategory, seller: Seller): Product => {
  const updatedCode = resolveProductCode(product, seller)
  const updatedMaxPrice = getMaxPrice(product, seller.price, updatedCode)
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

const applyPriceOnlyToProduct = (product: ProductCategory, seller: Seller): Product => {
  const updatedCode = resolveProductCode(product, seller)
  const updatedMaxPrice = getMaxPrice(product, seller.price, updatedCode)
  return {
    ...product,
    code: updatedCode,
    max_price: updatedMaxPrice,
    price: seller.price,
    isDuplicateCode: false,
    isDuplicateSeller: false,
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const productId =
    typeof args.get('product-id') === 'string' ? (args.get('product-id') as string) : ''
  const productCode =
    typeof args.get('product-code') === 'string' ? (args.get('product-code') as string) : ''
  const categoryId =
    typeof args.get('category-id') === 'string' ? (args.get('category-id') as string) : ''

  if (!productId && !productCode) {
    log.error('Provide --product-id or --product-code')
    return
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const cookiesPath = path.join(__dirname, syncConfig.cookiesPath)
  const reportsPath = path.join(__dirname, 'reports')
  const perProductConfigMap = buildPerProductConfigMap()

  log.info(`Loading cookies from ${cookiesPath}`)
  log.info(`Target product id: ${productId || '-'}`)
  log.info(`Target product code: ${productCode || '-'}`)
  log.info(`Category filter: ${categoryId || 'all'}`)
  await fs.mkdir(reportsPath, { recursive: true })
  const cookies = await getCookies(cookiesPath)

  const digiflazz = new DigiflazzService(cookies)
  await digiflazz.initialize()

  const report: {
    productId?: string
    productCode?: string
    productName?: string
    categoryId?: string
    categoryName?: string
    previousSeller?: string
    previousPrice?: number
    maxPriceBefore?: number
    maxPriceAfter?: number
    nextSeller?: string
    nextPrice?: number
    codeBefore?: string
    codeAfter?: string
    status: 'updated' | 'skipped' | 'error'
    reason?: string
    updateMessage?: string
    updatedAt: string
  } = {
    status: 'skipped',
    updatedAt: new Date().toISOString(),
  }

  try {
    const categoryResponse = await digiflazz.getProductCategory()
    const categories = categoryId
      ? categoryResponse.data.filter((category) => category.id === categoryId)
      : categoryResponse.data

    if (categories.length === 0) {
      report.status = 'error'
      report.reason = 'Category not found'
      log.error('Category not found.')
    } else {
      let foundProduct: ProductCategory | null = null
      let foundCategory: { id: string; name: string } | null = null

      for (const category of categories) {
        await sleep(1000)
        const detailResponse = await digiflazz.getProductCategoryDetail(category.id)
        const product = detailResponse.data.find((item) =>
          productId
            ? item.product_id === productId
            : item.code?.toLowerCase() === productCode.toLowerCase(),
        )

        if (product) {
          foundProduct = product
          foundCategory = category
          break
        }
      }

      if (!foundProduct || !foundCategory) {
        report.status = 'error'
        report.reason = 'Product not found'
        log.error('Product not found in selected categories.')
      } else {
        report.productId = foundProduct.id
        report.productCode = foundProduct.code
        report.productName = foundProduct.product
        report.categoryId = foundCategory.id
        report.categoryName = foundCategory.name
        report.previousSeller = foundProduct.seller
        report.previousPrice = foundProduct.price
        report.maxPriceBefore = foundProduct.max_price
        report.codeBefore = foundProduct.code

        const perProductConfig = getPerProductConfig(perProductConfigMap, foundProduct)
        const updateMode = perProductConfig?.updateMode ?? syncConfig.updateMode

        await sleep(1000)
        const sellerResponse = await digiflazz.getProductSeller(foundProduct.id)

        if (updateMode === 'price-only') {
          const currentSeller = pickCurrentSeller(
            foundProduct,
            sellerResponse.data,
            perProductConfig,
          )
          if (!currentSeller) {
            report.status = 'error'
            report.reason = 'Seller tidak ditemukan'
            log.warn('Seller tidak ditemukan.')
          } else {
            const updatedProduct = applyPriceOnlyToProduct(foundProduct, currentSeller)
            log.info(
              `${foundProduct.product} (${foundProduct.product_id}) price-only seller ${currentSeller.seller} | price ${currentSeller.price}`,
            )

            await sleep(1000)
            try {
              const updateResult = await digiflazz.updateMultiple({ products: [updatedProduct] })
              report.status = 'updated'
              report.nextSeller = foundProduct.seller
              report.nextPrice = currentSeller.price
              report.maxPriceAfter = updatedProduct.max_price
              report.codeAfter = updatedProduct.code
              report.updateMessage = updateResult.message
              log.success(`Update result: ${updateResult.message}`)
            } catch (error) {
              const detail = extractErrorDetail(error)
              const message = detail.message ?? 'Unknown error'
              report.status = 'error'
              report.reason = message
              log.error(`Update multiple failed: ${message}`)
              if (detail.data) {
                log.error(`Update multiple error detail: ${safeStringify(detail.data)}`)
              }
              const errors = extractErrorMessages(detail)
              if (errors.length) {
                log.error(`Update multiple errors: ${errors.join(' | ')}`)
              }
              const failureReport = {
                productId: foundProduct.product_id,
                code: updatedProduct.code,
                price: updatedProduct.price,
                max_price: updatedProduct.max_price,
                seller: updatedProduct.seller,
                seller_sku_id: updatedProduct.seller_sku_id,
                error: detail,
                requestBody: {
                  products: [updatedProduct],
                },
                createdAt: new Date().toISOString(),
              }
              const failureFile = path.join(
                reportsPath,
                `failed-update-single-${toSafeFilename(foundProduct.product_id)}.json`,
              )
              await fs.writeFile(failureFile, JSON.stringify(failureReport, null, 2))
              log.muted(`Failure report saved: ${failureFile}`)
            }
          }
        } else {
          const bestSeller = pickBestSeller(foundProduct, sellerResponse.data, perProductConfig)

          if (!bestSeller) {
            report.status = 'error'
            report.reason = 'Seller tidak ditemukan'
            log.warn('Seller tidak ditemukan.')
          } else {
            const updatedProduct = applySellerToProduct(foundProduct, bestSeller)
            const sellerChanged = foundProduct.seller !== bestSeller.seller
            const sellerLabel = sellerChanged
              ? `seller ${foundProduct.seller || '-'} -> ${bestSeller.seller}`
              : `seller ${bestSeller.seller}`
            log.info(
              `${foundProduct.product} (${foundProduct.product_id}) ${sellerLabel} | price ${bestSeller.price}`,
            )

            await sleep(1000)
            try {
              const updateResult = await digiflazz.updateMultiple({ products: [updatedProduct] })
              report.status = 'updated'
              report.nextSeller = bestSeller.seller
              report.nextPrice = bestSeller.price
              report.maxPriceAfter = updatedProduct.max_price
              report.codeAfter = updatedProduct.code
              report.updateMessage = updateResult.message
              log.success(`Update result: ${updateResult.message}`)
            } catch (error) {
              const detail = extractErrorDetail(error)
              const message = detail.message ?? 'Unknown error'
              report.status = 'error'
              report.reason = message
              log.error(`Update multiple failed: ${message}`)
              if (detail.data) {
                log.error(`Update multiple error detail: ${safeStringify(detail.data)}`)
              }
              const errors = extractErrorMessages(detail)
              if (errors.length) {
                log.error(`Update multiple errors: ${errors.join(' | ')}`)
              }
              const failureReport = {
                productId: foundProduct.product_id,
                code: updatedProduct.code,
                price: updatedProduct.price,
                max_price: updatedProduct.max_price,
                seller: updatedProduct.seller,
                seller_sku_id: updatedProduct.seller_sku_id,
                error: detail,
                createdAt: new Date().toISOString(),
              }
              const failureFile = path.join(
                reportsPath,
                `failed-update-single-${toSafeFilename(foundProduct.product_id)}.json`,
              )
              await fs.writeFile(failureFile, JSON.stringify(failureReport, null, 2))
              log.muted(`Failure report saved: ${failureFile}`)
            }
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    report.status = 'error'
    report.reason = message
    log.error(message)
  }

  const reportName = toSafeFilename(report.productId || productId || productCode || 'unknown')
  const reportFile = path.join(reportsPath, `single-${reportName}.json`)
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2))
  log.muted(`Report saved: ${reportFile}`)
}

main().catch((error: Error) => {
  log.error(error.message)
})
