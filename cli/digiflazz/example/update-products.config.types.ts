export type MaxPriceMode = 'same' | 'markup'

export type UpdateMode = 'seller' | 'price-only'

export type AutoFillProductCodeConfig =
  | boolean
  | {
      enabled: boolean
      prefix?: string
      length?: number
    }

export type MaxPriceConfig = {
  mode: MaxPriceMode
  markup: {
    amount: number
    perCode: Record<string, number>
  }
}

export type SyncConfig = {
  cookiesPath: string
  categories: string[]
  subCategoryTypeIds: string[]
  excludeProductCodes: string[]
  updateMode: UpdateMode
  perProduct: Record<
    string,
    {
      updateMode?: UpdateMode
      preferredSellers?: string[]
      allowedSellerSkuCodes?: string[]
    }
  >
  report: {
    enabled: boolean
    path: string
  }
  autoFillProductCode: AutoFillProductCodeConfig
  maxPrice: MaxPriceConfig
  onlyProblematic: boolean
  problematicCriteria: {
    inactiveSeller: boolean
    priceOverMax: boolean
  }
  sellerFilter: {
    minRating: number
    minRatingSteps: number[]
    blacklist: string[]
    requireActive: boolean
    enforceMaxPrice: boolean
  }
}
