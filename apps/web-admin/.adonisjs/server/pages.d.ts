import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<typeof import('../../inertia/pages/auth/login.tsx')['default']>
    'auth/register': ExtractProps<typeof import('../../inertia/pages/auth/register.tsx')['default']>
    'balance-mutations/index': ExtractProps<
      typeof import('../../inertia/pages/balance-mutations/index.tsx')['default']
    >
    'blog/articles/form': ExtractProps<
      typeof import('../../inertia/pages/blog/articles/form.tsx')['default']
    >
    'blog/articles/index': ExtractProps<
      typeof import('../../inertia/pages/blog/articles/index.tsx')['default']
    >
    'blog/categories/index': ExtractProps<
      typeof import('../../inertia/pages/blog/categories/index.tsx')['default']
    >
    'configs/banners/index': ExtractProps<
      typeof import('../../inertia/pages/configs/banners/index.tsx')['default']
    >
    'configs/fast-menu/add-product-category-modal': ExtractProps<
      typeof import('../../inertia/pages/configs/fast-menu/add-product-category-modal.tsx')['default']
    >
    'configs/fast-menu/detail': ExtractProps<
      typeof import('../../inertia/pages/configs/fast-menu/detail.tsx')['default']
    >
    'configs/fast-menu/edit-modal': ExtractProps<
      typeof import('../../inertia/pages/configs/fast-menu/edit-modal.tsx')['default']
    >
    'configs/fast-menu/index': ExtractProps<
      typeof import('../../inertia/pages/configs/fast-menu/index.tsx')['default']
    >
    'configs/home-product/add-product-category-modal': ExtractProps<
      typeof import('../../inertia/pages/configs/home-product/add-product-category-modal.tsx')['default']
    >
    'configs/home-product/detail': ExtractProps<
      typeof import('../../inertia/pages/configs/home-product/detail.tsx')['default']
    >
    'configs/home-product/edit-modal': ExtractProps<
      typeof import('../../inertia/pages/configs/home-product/edit-modal.tsx')['default']
    >
    'configs/home-product/index': ExtractProps<
      typeof import('../../inertia/pages/configs/home-product/index.tsx')['default']
    >
    'configs/pages/form': ExtractProps<
      typeof import('../../inertia/pages/configs/pages/form.tsx')['default']
    >
    'configs/pages/index': ExtractProps<
      typeof import('../../inertia/pages/configs/pages/index.tsx')['default']
    >
    'configs/settings/general': ExtractProps<
      typeof import('../../inertia/pages/configs/settings/general.tsx')['default']
    >
    'deposits/change-status-modal': ExtractProps<
      typeof import('../../inertia/pages/deposits/change-status-modal.tsx')['default']
    >
    'deposits/detail-modal': ExtractProps<
      typeof import('../../inertia/pages/deposits/detail-modal.tsx')['default']
    >
    'deposits/index': ExtractProps<
      typeof import('../../inertia/pages/deposits/index.tsx')['default']
    >
    'errors/not_found': ExtractProps<
      typeof import('../../inertia/pages/errors/not_found.tsx')['default']
    >
    'errors/server_error': ExtractProps<
      typeof import('../../inertia/pages/errors/server_error.tsx')['default']
    >
    home: ExtractProps<typeof import('../../inertia/pages/home.tsx')['default']>
    'input-fields/create-modal': ExtractProps<
      typeof import('../../inertia/pages/input-fields/create-modal.tsx')['default']
    >
    'input-fields/index': ExtractProps<
      typeof import('../../inertia/pages/input-fields/index.tsx')['default']
    >
    'offers/discount/create': ExtractProps<
      typeof import('../../inertia/pages/offers/discount/create.tsx')['default']
    >
    'offers/discount/edit': ExtractProps<
      typeof import('../../inertia/pages/offers/discount/edit.tsx')['default']
    >
    'offers/discount/index': ExtractProps<
      typeof import('../../inertia/pages/offers/discount/index.tsx')['default']
    >
    'offers/flash-sale/create': ExtractProps<
      typeof import('../../inertia/pages/offers/flash-sale/create.tsx')['default']
    >
    'offers/flash-sale/edit': ExtractProps<
      typeof import('../../inertia/pages/offers/flash-sale/edit.tsx')['default']
    >
    'offers/flash-sale/index': ExtractProps<
      typeof import('../../inertia/pages/offers/flash-sale/index.tsx')['default']
    >
    'offers/is-available-switch': ExtractProps<
      typeof import('../../inertia/pages/offers/is-available-switch.tsx')['default']
    >
    'offers/offer-payment/add-modal': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-payment/add-modal.tsx')['default']
    >
    'offers/offer-payment/delete-modal': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-payment/delete-modal.tsx')['default']
    >
    'offers/offer-payment/index': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-payment/index.tsx')['default']
    >
    'offers/offer-product/add-modal': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-product/add-modal.tsx')['default']
    >
    'offers/offer-product/delete-modal': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-product/delete-modal.tsx')['default']
    >
    'offers/offer-product/index': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-product/index.tsx')['default']
    >
    'offers/offer-user/add-modal': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-user/add-modal.tsx')['default']
    >
    'offers/offer-user/delete-modal': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-user/delete-modal.tsx')['default']
    >
    'offers/offer-user/index': ExtractProps<
      typeof import('../../inertia/pages/offers/offer-user/index.tsx')['default']
    >
    'offers/used-offers': ExtractProps<
      typeof import('../../inertia/pages/offers/used-offers.tsx')['default']
    >
    'offers/voucher/create': ExtractProps<
      typeof import('../../inertia/pages/offers/voucher/create.tsx')['default']
    >
    'offers/voucher/edit': ExtractProps<
      typeof import('../../inertia/pages/offers/voucher/edit.tsx')['default']
    >
    'offers/voucher/index': ExtractProps<
      typeof import('../../inertia/pages/offers/voucher/index.tsx')['default']
    >
    'orders/change-order-status-modal': ExtractProps<
      typeof import('../../inertia/pages/orders/change-order-status-modal.tsx')['default']
    >
    'orders/change-payment-status-modal': ExtractProps<
      typeof import('../../inertia/pages/orders/change-payment-status-modal.tsx')['default']
    >
    'orders/change-refund-status-modal': ExtractProps<
      typeof import('../../inertia/pages/orders/change-refund-status-modal.tsx')['default']
    >
    'orders/index': ExtractProps<typeof import('../../inertia/pages/orders/index.tsx')['default']>
    'orders/order-detail-modal': ExtractProps<
      typeof import('../../inertia/pages/orders/order-detail-modal.tsx')['default']
    >
    'orders/prepaid/index': ExtractProps<
      typeof import('../../inertia/pages/orders/prepaid/index.tsx')['default']
    >
    'orders/refund-modal': ExtractProps<
      typeof import('../../inertia/pages/orders/refund-modal.tsx')['default']
    >
    'payments/categories/add-payment-category-modal': ExtractProps<
      typeof import('../../inertia/pages/payments/categories/add-payment-category-modal.tsx')['default']
    >
    'payments/categories/edit-payment-category-modal': ExtractProps<
      typeof import('../../inertia/pages/payments/categories/edit-payment-category-modal.tsx')['default']
    >
    'payments/categories/index': ExtractProps<
      typeof import('../../inertia/pages/payments/categories/index.tsx')['default']
    >
    'payments/methods/add-modal': ExtractProps<
      typeof import('../../inertia/pages/payments/methods/add-modal.tsx')['default']
    >
    'payments/methods/edit-modal': ExtractProps<
      typeof import('../../inertia/pages/payments/methods/edit-modal.tsx')['default']
    >
    'payments/methods/index': ExtractProps<
      typeof import('../../inertia/pages/payments/methods/index.tsx')['default']
    >
    'payments/methods/is-available-switch': ExtractProps<
      typeof import('../../inertia/pages/payments/methods/is-available-switch.tsx')['default']
    >
    'products/add-modal': ExtractProps<
      typeof import('../../inertia/pages/products/add-modal.tsx')['default']
    >
    'products/add-provider-modal': ExtractProps<
      typeof import('../../inertia/pages/products/add-provider-modal.tsx')['default']
    >
    'products/delete-modal': ExtractProps<
      typeof import('../../inertia/pages/products/delete-modal.tsx')['default']
    >
    'products/edit-modal': ExtractProps<
      typeof import('../../inertia/pages/products/edit-modal.tsx')['default']
    >
    'products/index': ExtractProps<
      typeof import('../../inertia/pages/products/index.tsx')['default']
    >
    'products/is-available-switch': ExtractProps<
      typeof import('../../inertia/pages/products/is-available-switch.tsx')['default']
    >
    'products/postpaid/bpjs-kesehatan/create': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/bpjs-kesehatan/create.tsx')['default']
    >
    'products/postpaid/bpjs-kesehatan/edit': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/bpjs-kesehatan/edit.tsx')['default']
    >
    'products/postpaid/bpjs-kesehatan/index': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/bpjs-kesehatan/index.tsx')['default']
    >
    'products/postpaid/bpjs-ketenagakerjaan/create': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/bpjs-ketenagakerjaan/create.tsx')['default']
    >
    'products/postpaid/bpjs-ketenagakerjaan/edit': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/bpjs-ketenagakerjaan/edit.tsx')['default']
    >
    'products/postpaid/bpjs-ketenagakerjaan/index': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/bpjs-ketenagakerjaan/index.tsx')['default']
    >
    'products/postpaid/internet/create': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/internet/create.tsx')['default']
    >
    'products/postpaid/internet/edit': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/internet/edit.tsx')['default']
    >
    'products/postpaid/internet/index': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/internet/index.tsx')['default']
    >
    'products/postpaid/pdam/create': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/pdam/create.tsx')['default']
    >
    'products/postpaid/pdam/edit': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/pdam/edit.tsx')['default']
    >
    'products/postpaid/pdam/index': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/pdam/index.tsx')['default']
    >
    'products/postpaid/tagihan-pln/create': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/tagihan-pln/create.tsx')['default']
    >
    'products/postpaid/tagihan-pln/edit': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/tagihan-pln/edit.tsx')['default']
    >
    'products/postpaid/tagihan-pln/index': ExtractProps<
      typeof import('../../inertia/pages/products/postpaid/tagihan-pln/index.tsx')['default']
    >
    'products/prepaid/e-wallet/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/e-wallet/create.tsx')['default']
    >
    'products/prepaid/e-wallet/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/e-wallet/edit.tsx')['default']
    >
    'products/prepaid/e-wallet/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/e-wallet/index.tsx')['default']
    >
    'products/prepaid/games/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/games/create.tsx')['default']
    >
    'products/prepaid/games/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/games/edit.tsx')['default']
    >
    'products/prepaid/games/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/games/index.tsx')['default']
    >
    'products/prepaid/kuota/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/kuota/create.tsx')['default']
    >
    'products/prepaid/kuota/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/kuota/edit.tsx')['default']
    >
    'products/prepaid/kuota/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/kuota/index.tsx')['default']
    >
    'products/prepaid/other-prepaid/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/other-prepaid/create.tsx')['default']
    >
    'products/prepaid/other-prepaid/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/other-prepaid/edit.tsx')['default']
    >
    'products/prepaid/other-prepaid/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/other-prepaid/index.tsx')['default']
    >
    'products/prepaid/pulsa/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/pulsa/create.tsx')['default']
    >
    'products/prepaid/pulsa/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/pulsa/edit.tsx')['default']
    >
    'products/prepaid/pulsa/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/pulsa/index.tsx')['default']
    >
    'products/prepaid/token-pln/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/token-pln/create.tsx')['default']
    >
    'products/prepaid/token-pln/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/token-pln/edit.tsx')['default']
    >
    'products/prepaid/token-pln/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/token-pln/index.tsx')['default']
    >
    'products/prepaid/voucher/create': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/voucher/create.tsx')['default']
    >
    'products/prepaid/voucher/edit': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/voucher/edit.tsx')['default']
    >
    'products/prepaid/voucher/index': ExtractProps<
      typeof import('../../inertia/pages/products/prepaid/voucher/index.tsx')['default']
    >
    'products/product-categories/create-product-category': ExtractProps<
      typeof import('../../inertia/pages/products/product-categories/create-product-category.tsx')['default']
    >
    'products/product-categories/edit-product-category': ExtractProps<
      typeof import('../../inertia/pages/products/product-categories/edit-product-category.tsx')['default']
    >
    'products/product-categories/input-fields/add-input-fields': ExtractProps<
      typeof import('../../inertia/pages/products/product-categories/input-fields/add-input-fields.tsx')['default']
    >
    'products/product-categories/input-fields/index': ExtractProps<
      typeof import('../../inertia/pages/products/product-categories/input-fields/index.tsx')['default']
    >
    'products/product-categories/is-avalable': ExtractProps<
      typeof import('../../inertia/pages/products/product-categories/is-avalable.tsx')['default']
    >
    'products/product-categories/product-category-detail': ExtractProps<
      typeof import('../../inertia/pages/products/product-categories/product-category-detail.tsx')['default']
    >
    'products/product-sub-categories/add-modal': ExtractProps<
      typeof import('../../inertia/pages/products/product-sub-categories/add-modal.tsx')['default']
    >
    'products/product-sub-categories/edit-modal': ExtractProps<
      typeof import('../../inertia/pages/products/product-sub-categories/edit-modal.tsx')['default']
    >
    'products/product-sub-categories/index': ExtractProps<
      typeof import('../../inertia/pages/products/product-sub-categories/index.tsx')['default']
    >
    'products/section-products': ExtractProps<
      typeof import('../../inertia/pages/products/section-products.tsx')['default']
    >
    'products/update-provider-price-modal': ExtractProps<
      typeof import('../../inertia/pages/products/update-provider-price-modal.tsx')['default']
    >
    'user/add-balance-modal': ExtractProps<
      typeof import('../../inertia/pages/user/add-balance-modal.tsx')['default']
    >
    'user/add-user': ExtractProps<typeof import('../../inertia/pages/user/add-user.tsx')['default']>
    'user/deduct-balance-modal': ExtractProps<
      typeof import('../../inertia/pages/user/deduct-balance-modal.tsx')['default']
    >
    'user/edit-user': ExtractProps<
      typeof import('../../inertia/pages/user/edit-user.tsx')['default']
    >
    'user/index': ExtractProps<typeof import('../../inertia/pages/user/index.tsx')['default']>
  }
}
