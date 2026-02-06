/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const UserController = () => import('#controllers/users_controller')
const ProductCategoryController = () => import('#controllers/product_categories_controller')
const ProductCategoryPostpaidController = () =>
  import('#controllers/product_categories_postpaid_controller')
const FileManagerController = () => import('#controllers/file_managers_controller')
const InputFieldController = () => import('#controllers/input_fields_controller')
const ProductSubCategoryController = () => import('#controllers/product_sub_categories_controller')
const ProductController = () => import('#controllers/products_controller')
const ProvidersController = () => import('#controllers/providers_controller')
const PaymentController = () => import('#controllers/payments_controller')
const OfferController = () => import('#controllers/offer_controller')
const DepositController = () => import('#controllers/deposits_controller')
const OrderController = () => import('#controllers/orders_controller')
const BalanceMutationController = () => import('#controllers/balance_mutations_controller')
const ConfigHomesController = () => import('#controllers/configs/config_homes_controller')
const ConfigFastMenuController = () => import('#controllers/configs/config_home_fast_menu')
const BannerController = () => import('#controllers/configs/banners_controller')
const ConfigSettingsController = () => import('#controllers/configs/settings_controller')
const PagesController = () => import('#controllers/configs/pages_controller')
const ArticleCategoriesController = () => import('#controllers/blog/article_categories_controller')
const ArticlesController = () => import('#controllers/blog/articles_controller')

import router from '@adonisjs/core/services/router'
import { UserRole } from '@repo/db/types'
import { middleware } from './kernel.js'

router.get('/', async ({ response }) => {
  return response.send('Hmm, sepertinya ada yang salah.')
})

router
  .group(() => {
    router.get('/register', [AuthController, 'register']).as('auth.register')
    router.post('/register', [AuthController, 'postRegister']).as('auth.postRegister')
    router.get('/login', [AuthController, 'login']).as('auth.login')
    router.post('/login', [AuthController, 'postLogin']).as('auth.postLogin')
    router.get('/logout', [AuthController, 'logout']).as('auth.logout')
  })

  .prefix('/auth')

router
  .group(() => {
    router.get('/', [HomeController, 'index']).as('home.index')
  })
  .prefix('/admin')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/me', [UserController, 'me']).as('users.me')
    router.get('/', [UserController, 'index']).as('users.index')
    router.post('/', [UserController, 'postCreate']).as('users.store')

    router.get('/get-json', [UserController, 'getUsersJson']).as('users.getJson')

    router.delete('/:id', [UserController, 'postDelete']).as('users.delete')
    router.patch('/:id', [UserController, 'postUpdate']).as('users.update')
    router.post('/:id/add-balance', [UserController, 'addBalance']).as('users.addBalance')
    router.post('/:id/deduct-balance', [UserController, 'deductBalance']).as('users.deductBalance')
  })
  .prefix('/admin/users')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [ProductCategoryController, 'index']).as('productCategories.index')

    // Games
    router
      .get('/game', [ProductCategoryController, 'indexGames'])
      .as('productCategories.indexGames')
    router
      .get('/game/create', [ProductCategoryController, 'createGames'])
      .as('productCategories.createGame')
    router
      .get('/game/:id/edit', [ProductCategoryController, 'editGames'])
      .as('productCategories.editGame')

    // pulsa
    router
      .get('/pulsa', [ProductCategoryController, 'indexPulsa'])
      .as('productCategories.indexPulsa')
    router
      .get('/pulsa/create', [ProductCategoryController, 'createPulsa'])
      .as('productCategories.createPulsa')
    router
      .get('/pulsa/:id/edit', [ProductCategoryController, 'editPulsa'])
      .as('productCategories.editPulsa')

    // kuota
    router
      .get('/kuota', [ProductCategoryController, 'indexKuota'])
      .as('productCategories.indexKuota')
    router
      .get('/kuota/create', [ProductCategoryController, 'createKuota'])
      .as('productCategories.createKuota')
    router
      .get('/kuota/:id/edit', [ProductCategoryController, 'editKuota'])
      .as('productCategories.editKuota')

    // token-pln
    router
      .get('/token-pln', [ProductCategoryController, 'indexTokenPln'])
      .as('productCategories.indexTokenPln')
    router
      .get('/token-pln/create', [ProductCategoryController, 'createTokenPln'])
      .as('productCategories.createTokenPln')
    router
      .get('/token-pln/:id/edit', [ProductCategoryController, 'editTokenPln'])
      .as('productCategories.editTokenPln')

    // e-wallet
    router
      .get('/e-wallet', [ProductCategoryController, 'indexEWallet'])
      .as('productCategories.indexEWallet')
    router
      .get('/e-wallet/create', [ProductCategoryController, 'createEWallet'])
      .as('productCategories.createEWallet')
    router
      .get('/e-wallet/:id/edit', [ProductCategoryController, 'editEWallet'])
      .as('productCategories.editEWallet')

    // voucher
    router
      .get('/voucher', [ProductCategoryController, 'indexVoucher'])
      .as('productCategories.indexVoucher')
    router
      .get('/voucher/create', [ProductCategoryController, 'createVoucher'])
      .as('productCategories.createVoucher')
    router
      .get('/voucher/:id/edit', [ProductCategoryController, 'editVoucher'])
      .as('productCategories.editVoucher')

    // other-prepaid
    router
      .get('/other-prepaid', [ProductCategoryController, 'indexOtherPrepaid'])
      .as('productCategories.indexOtherPrepaid')
    router
      .get('/other-prepaid/create', [ProductCategoryController, 'createOtherPrepaid'])
      .as('productCategories.createOtherPrepaid')
    router
      .get('/other-prepaid/:id/edit', [ProductCategoryController, 'editOtherPrepaid'])
      .as('productCategories.editOtherPrepaid')

    // postpaid
    // Tagihan PLN
    router
      .get('/postpaid/tagihan-pln', [ProductCategoryPostpaidController, 'indexTagihanPLN'])
      .as('productCategories.indexPostpaidTagihanPln')
    router
      .get('/postpaid/tagihan-pln/create', [ProductCategoryPostpaidController, 'createTagihanPLN'])
      .as('productCategories.createPostpaidTagihanPln')
    router
      .get('/postpaid/tagihan-pln/:id/edit', [ProductCategoryPostpaidController, 'editTagihanPLN'])
      .as('productCategories.editPostpaidTagihanPln')

    // PDAM
    router
      .get('/postpaid/pdam', [ProductCategoryPostpaidController, 'indexPDAM'])
      .as('productCategories.indexPostpaidPDAM')
    router
      .get('/postpaid/pdam/create', [ProductCategoryPostpaidController, 'createPDAM'])
      .as('productCategories.createPostpaidPDAM')
    router
      .get('/postpaid/pdam/:id/edit', [ProductCategoryPostpaidController, 'editPDAM'])
      .as('productCategories.editPostpaidPDAM')

    // Internet
    router
      .get('/postpaid/internet', [ProductCategoryPostpaidController, 'indexInternet'])
      .as('productCategories.indexPostpaidInternet')
    router
      .get('/postpaid/internet/create', [ProductCategoryPostpaidController, 'createInternet'])
      .as('productCategories.createPostpaidInternet')
    router
      .get('/postpaid/internet/:id/edit', [ProductCategoryPostpaidController, 'editInternet'])
      .as('productCategories.editPostpaidInternet')

    // BPJS Kesehatan
    router
      .get('/postpaid/bpjs-kesehatan', [ProductCategoryPostpaidController, 'indexBPJSKesehatan'])
      .as('productCategories.indexPostpaidBPJSKesehatan')
    router
      .get('/postpaid/bpjs-kesehatan/create', [
        ProductCategoryPostpaidController,
        'createBPJSKesehatan',
      ])
      .as('productCategories.createPostpaidBPJSKesehatan')
    router
      .get('/postpaid/bpjs-kesehatan/:id/edit', [
        ProductCategoryPostpaidController,
        'editBPJSKesehatan',
      ])
      .as('productCategories.editPostpaidBPJSKesehatan')

    // BPJS Ketenagakerjaan
    router
      .get('/postpaid/bpjs-ketenagakerjaan', [
        ProductCategoryPostpaidController,
        'indexBPJSKetenagakerjaan',
      ])
      .as('productCategories.indexPostpaidBPJSKetenagakerjaan')
    router
      .get('/postpaid/bpjs-ketenagakerjaan/create', [
        ProductCategoryPostpaidController,
        'createBPJSKetenagakerjaan',
      ])
      .as('productCategories.createPostpaidBPJSKetenagakerjaan')
    router
      .get('/postpaid/bpjs-ketenagakerjaan/:id/edit', [
        ProductCategoryPostpaidController,
        'editBPJSKetenagakerjaan',
      ])
      .as('productCategories.editPostpaidBPJSKetenagakerjaan')

    // any
    router
      .get('/get-json', [ProductCategoryController, 'getProductCategoryByCategoryNameJson'])
      .as('productCategories.getProductCategoryByCategoryNameJson')

    router
      .get('/:billingType/:type/:id', [ProductCategoryController, 'detail'])
      .as('productCategories.detailWithBillingType')
    router.get('/:type/:id', [ProductCategoryController, 'detail']).as('productCategories.detail')

    router
      .post('/:type/create', [ProductCategoryController, 'postCreate'])
      .as('productCategories.postCreate')
    router
      .patch('/:type/:id', [ProductCategoryController, 'postEdit'])
      .as('productCategories.postEdit')
    router
      .delete('/:type/:id', [ProductCategoryController, 'postDelete'])
      .as('productCategories.delete')
  })
  .prefix('/admin/product-categories')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [FileManagerController, 'list']).as('fileManagers.list')
    router.delete('/:id', [FileManagerController, 'destroy']).as('fileManagers.delete')
    router.post('/upload', [FileManagerController, 'upload']).as('fileManagers.upload')
    router.post('/upload-many', [FileManagerController, 'uploadMany']).as('fileManagers.uploadMany')
    router
      .post('/delete-bulk', [FileManagerController, 'destroyBulk'])
      .as('fileManagers.deleteBulk')
    router.get('/:id', [FileManagerController, 'getById']).as('fileManagers.getById')
  })
  .prefix('/admin/file-managers')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [InputFieldController, 'index']).as('inputFields.index')
    router.post('/', [InputFieldController, 'postCreate']).as('inputFields.postCreate')
    router.get('/all', [InputFieldController, 'getAllInputFields']).as('inputFields.getAll')

    router.post('/connect', [InputFieldController, 'postConnect']).as('inputFields.postConnect')
    router
      .delete('/disconnect/:id', [InputFieldController, 'postDisconnect'])
      .as('inputFields.postDisconnect')

    router.patch('/:id', [InputFieldController, 'postUpdate']).as('inputFields.postUpdate')
    router.delete('/:id', [InputFieldController, 'postDelete']).as('inputFields.delete')
  })
  .prefix('/admin/input-fields')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router
      .post('/', [ProductSubCategoryController, 'postCreate'])
      .as('productSubCategories.postCreate')
    router.get('/:id', [ProductSubCategoryController, 'detail']).as('productSubCategories.detail')
    router
      .patch('/:id', [ProductSubCategoryController, 'postUpdate'])
      .as('productSubCategories.postUpdate')
    router
      .delete('/:id', [ProductSubCategoryController, 'postDelete'])
      .as('productSubCategories.delete')
  })
  .prefix('/admin/product-sub-categories')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.post('/', [ProductController, 'postCreate']).as('products.postCreate')
    router.get('/all', [ProductController, 'getAll']).as('products.getAll')
    router
      .get('/get-json', [ProductController, 'getProductByCategoryNameJson'])
      .as('products.getProductByCategoryNameJson')
    router.get('/existing', [ProductController, 'getExistingProviderCodes']).as('products.exists')
    router.get('/provider-map', [ProductController, 'getProviderMap']).as('products.providerMap')

    router.get('/:id', [ProductController, 'detail']).as('products.detail')
    router.patch('/:id', [ProductController, 'postUpdate']).as('products.postEdit')
    router
      .patch('/:id/update-is-available', [ProductController, 'updateIsAvailable'])
      .as('products.postUpdateIsAvailable')
    router
      .patch('/:id/update-provider-price', [ProductController, 'updateProviderPrice'])
      .as('products.updateProviderPrice')
    router.delete('/:id', [ProductController, 'postDelete']).as('products.delete')
  })
  .prefix('/admin/products')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/digiflazz/products', [ProvidersController, 'digiflazzProducts'])
  })
  .prefix('/admin/providers')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [PaymentController, 'indexCategory']).as('payments.categories.index')
    router.post('/', [PaymentController, 'postCreateCategory']).as('payments.categories.postCreate')
    router
      .patch('/:id', [PaymentController, 'postUpdateCategory'])
      .as('payments.categories.postEdit')
    router
      .delete('/:id', [PaymentController, 'postDeleteCategory'])
      .as('payments.categories.delete')
  })
  .prefix('/admin/payments/categories')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [PaymentController, 'indexPaymentMethod']).as('payments.methods.index')
    router
      .post('/', [PaymentController, 'postCreatePaymentMethod'])
      .as('payments.methods.postCreate')

    router
      .get('/get-json', [PaymentController, 'getPaymentMethodJson'])
      .as('payments.methods.getJson')

    router
      .get('/:id', [PaymentController, 'detailPaymentMethod'])
      .as('payments.methods.detailPaymentMethod')
    router
      .patch('/:id', [PaymentController, 'postUpdatePaymentMethod'])
      .as('payments.methods.postEdit')
    router
      .delete('/:id', [PaymentController, 'postDeletePaymentMethod'])
      .as('payments.methods.delete')
  })
  .prefix('/admin/payments/methods')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/voucher', [OfferController, 'indexVoucher']).as('offers.indexVoucher')
    router.get('/voucher/create', [OfferController, 'createVoucher']).as('offers.createVoucher')
    router.get('/voucher/:id/edit', [OfferController, 'editVoucher']).as('offers.editVoucher')

    router.get('/discount', [OfferController, 'indexDiscount']).as('offers.indexDiscount')
    router.get('/discount/create', [OfferController, 'createDiscount']).as('offers.createDiscount')
    router.get('/discount/:id/edit', [OfferController, 'editDiscount']).as('offers.editDiscount')

    router.get('/flash-sale', [OfferController, 'indexFlashSale']).as('offers.indexFlashSale')
    router
      .get('/flash-sale/create', [OfferController, 'createFlashSale'])
      .as('offers.createFlashSale')
    router
      .get('/flash-sale/:id/edit', [OfferController, 'editFlashSale'])
      .as('offers.editFlashSale')

    router.get('/history', [OfferController, 'getUsedOffers']).as('offers.used')
    router.post('/create', [OfferController, 'postCreate']).as('offers.postCreate')
    router.patch('/:id/edit', [OfferController, 'postUpdate']).as('offers.postUpdate')
    router.delete('/:id', [OfferController, 'postDelete']).as('offers.delete')

    router.post('/:id/connect/user', [OfferController, 'connectUser']).as('offers.connectUser')
    router
      .post('/:id/disconnect/user', [OfferController, 'disconnectUser'])
      .as('offers.disconnectUser')
    router
      .post('/:id/connect/product', [OfferController, 'connectProduct'])
      .as('offers.connectProduct')
    router
      .post('/:id/disconnect/product', [OfferController, 'disconnectProduct'])
      .as('offers.disconnectProduct')
    router
      .post('/:id/connect/payment-method', [OfferController, 'connectPaymentMethod'])
      .as('offers.connectPaymentMethod')
    router
      .post('/:id/disconnect/payment-method', [OfferController, 'disconnectPaymentMethod'])
      .as('offers.disconnectPaymentMethod')

    router.get('/:id/users', [OfferController, 'getOfferUsers']).as('offers.getOfferUsers')
    router.get('/:id/products', [OfferController, 'getOfferProducts']).as('offers.getOfferProducts')

    router
      .get('/:id/payment-methods', [OfferController, 'getOfferPaymentMethods'])
      .as('offers.getOfferPaymentMethods')
  })
  .prefix('/admin/offers')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [DepositController, 'index']).as('deposits.index')
    router.get('/:id', [DepositController, 'getById']).as('deposits.getById')
    router.patch('/:id', [DepositController, 'changeStatus']).as('deposits.changeStatus')
  })
  .prefix('/admin/deposits')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [OrderController, 'index']).as('order.index')
    router.get('/prepaid', [OrderController, 'indexPrepaid']).as('order.indexPrepaid')
    router.get('/:id', [OrderController, 'getById']).as('order.getById')
    router
      .patch('/:id/change-payment-status', [OrderController, 'changePaymentStatus'])
      .as('order.changePaymentStatus')
    router
      .patch('/:id/change-order-status', [OrderController, 'changeOrderStatus'])
      .as('order.changeOrderStatus')
    router
      .patch('/:id/change-refund-status', [OrderController, 'changeRefundStatus'])
      .as('order.changeRefundStatus')
    router.post('/:id/refund', [OrderController, 'refundToBalance']).as('order.refundOrder')
  })
  .prefix('/admin/orders')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [BalanceMutationController, 'index']).as('balanceMutations.index')
  })
  .prefix('/admin/balance-mutations')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [ConfigFastMenuController, 'index']).as('configFastMenu.index')
            router
              .post('/', [ConfigFastMenuController, 'createProductSection'])
              .as('configFastMenu.postCreate')

            router
              .post('/:id/connect-product', [ConfigFastMenuController, 'connectProductToSection'])
              .as('configFastMenu.connectProductToSection')

            router
              .post('/:id/bulk-connect-product', [
                ConfigFastMenuController,
                'bulkConnectProductToSection',
              ])
              .as('configFastMenu.bulkConnectProductToSection')

            router.post('/:id/disconnect-product', [
              ConfigFastMenuController,
              'disconnectProductFromSection',
            ])

            router.get('/:id', [ConfigFastMenuController, 'detail']).as('configFastMenu.detail')
            router
              .patch('/:id', [ConfigFastMenuController, 'updateProductSection'])
              .as('configFastMenu.postEdit')
            router
              .delete('/:id', [ConfigFastMenuController, 'deleteProductSection'])
              .as('configFastMenu.postDelete')
          })
          .prefix('/fast-menu')

        router.get('/product-sections', [ConfigHomesController, 'index']).as('configHomes.index')
        router
          .post('/product-sections', [ConfigHomesController, 'createProductSection'])
          .as('configHomes.postCreate')

        router
          .post('/product-sections/:id/connect-product', [
            ConfigHomesController,
            'connectProductToSection',
          ])
          .as('configHomes.connectProductToSection')

        router
          .post('/product-sections/:id/bulk-connect-product', [
            ConfigHomesController,
            'bulkConnectProductToSection',
          ])
          .as('configHomes.bulkConnectProductToSection')

        router.post('/product-sections/:id/disconnect-product', [
          ConfigHomesController,
          'disconnectProductFromSection',
        ])

        router
          .get('/product-sections/:id', [ConfigHomesController, 'detail'])
          .as('configHomes.detail')
        router
          .patch('/product-sections/:id', [ConfigHomesController, 'updateProductSection'])
          .as('configHomes.postEdit')
        router
          .delete('/product-sections/:id', [ConfigHomesController, 'deleteProductSection'])
          .as('configHomes.postDelete')

        // banners
        router.get('/banner', [BannerController, 'index']).as('banners.index')
        router.post('/banner', [BannerController, 'postCreate']).as('banners.postCreate')
        router.delete('/banner/:id', [BannerController, 'postDelete']).as('banners.delete')
      })
      .prefix('/home')

    router.get('/settings/general', [ConfigSettingsController, 'index'])
    router.patch('/settings/general', [ConfigSettingsController, 'update'])

    router
      .group(() => {
        router.get('/', [PagesController, 'index']).as('pages.index')
        router.get('/create', [PagesController, 'create']).as('pages.create')
        router.post('/', [PagesController, 'store']).as('pages.store')
        router.get('/:id/edit', [PagesController, 'edit']).as('pages.edit')
        router.patch('/:id', [PagesController, 'update']).as('pages.update')
        router.delete('/:id', [PagesController, 'destroy']).as('pages.destroy')
      })
      .prefix('/pages')
  })
  .prefix('/admin/config')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [ArticleCategoriesController, 'index']).as('articleCategories.index')
        router.post('/', [ArticleCategoriesController, 'store']).as('articleCategories.store')
        router
          .get('/get-json', [ArticleCategoriesController, 'getJson'])
          .as('articleCategories.getJson')
        router.patch('/:id', [ArticleCategoriesController, 'update']).as('articleCategories.update')
        router
          .delete('/:id', [ArticleCategoriesController, 'destroy'])
          .as('articleCategories.destroy')
      })
      .prefix('/categories')

    router
      .group(() => {
        router.get('/', [ArticlesController, 'index']).as('articles.index')
        router.get('/create', [ArticlesController, 'create']).as('articles.create')
        router.post('/', [ArticlesController, 'store']).as('articles.store')
        router.get('/:id/edit', [ArticlesController, 'edit']).as('articles.edit')
        router.patch('/:id', [ArticlesController, 'update']).as('articles.update')
        router.delete('/:id', [ArticlesController, 'destroy']).as('articles.destroy')
        router
          .post('/:id/toggle-publish', [ArticlesController, 'togglePublish'])
          .as('articles.togglePublish')
        router
          .post('/:id/toggle-featured', [ArticlesController, 'toggleFeatured'])
          .as('articles.toggleFeatured')
      })
      .prefix('/articles')
  })
  .prefix('/admin/blog')
  .middleware(middleware.role(UserRole.ADMIN))
