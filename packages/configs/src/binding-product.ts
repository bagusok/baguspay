import { ProductSpesialFeaturesKey } from './special-features-key'

export const BindingProduct = {
  PLN_PREPAID: {
    name: ProductSpesialFeaturesKey.PLN_PREPAID,
    productCategoryId: '2ab6083f-7f1e-4162-89a9-902c5b5e69be',
    productSubCategoryId: 'uuid',
    productId: ['uuid1', 'uuid2'],
  },
  PULSA: {
    name: 'Binding Pulsa',
    configs: {
      XL: {
        productCategoryId: '2ab6083f-7f1e-4162-89a9-902c5b5e69be',
        prefix: ['0817', '0818', '0819'],
      },
    },
    TELKOMSEL: {
      productCategoryId: '2ab6083f-7f1e-4162-89a9-902c5b5e69be',
      prefix: ['0812', '0813', '0821'],
    },
  },
  KUOTA: {
    name: 'Binding Kuota',
    configs: {
      XL: {
        productCategoryId: '2ab6083f-7f1e-4162-89a9-902c5b5e69be',
        prefix: ['0817', '0818', '0819'],
      },
    },
    TELKOMSEL: {
      productCategoryId: '2ab6083f-7f1e-4162-89a9-902c5b5e69be',
      prefix: ['0812', '0813', '0821'],
    },
  },
}
