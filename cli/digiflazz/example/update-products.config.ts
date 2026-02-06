import type { SyncConfig } from './update-products.config.types'

export const syncConfig: SyncConfig = {
  cookiesPath: 'cookies.json',
  categories: ['all'],
  subCategoryTypeIds: ['all'],
  excludeProductCodes: [],
  updateMode: 'seller',
  perProduct: {},
  report: {
    enabled: true,
    path: 'reports',
  },
  autoFillProductCode: {
    enabled: true,
    prefix: 'BP',
    length: 10,
  },
  maxPrice: {
    mode: 'markup',
    markup: {
      amount: 200,
      perCode: {} as Record<string, number>,
    },
  },
  onlyProblematic: true,
  problematicCriteria: {
    inactiveSeller: true,
    priceOverMax: true,
  },
  sellerFilter: {
    minRating: 4,
    minRatingSteps: [4, 3.5, 3],
    blacklist: ['CV SAGARAMOBILE'] as string[],
    requireActive: true,
    enforceMaxPrice: false,
  },
}
