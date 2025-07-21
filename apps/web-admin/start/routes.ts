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
const FileManagerController = () => import('#controllers/file_managers_controller')
const InputFieldController = () => import('#controllers/input_fields_controller')
const ProductSubCategoryController = () => import('#controllers/product_sub_categories_controller')
const ProductController = () => import('#controllers/products_controller')
const PaymentController = () => import('#controllers/payments_controller')
const OfferController = () => import('#controllers/offer_controller')

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { UserRole } from '@repo/db/types'
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
  })
  .prefix('/admin/users')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [ProductCategoryController, 'index']).as('productCategories.index')
    router.get('/create', [ProductCategoryController, 'create']).as('productCategories.create')
    router
      .post('/create', [ProductCategoryController, 'postCreate'])
      .as('productCategories.postCreate')

    router
      .get('/get-json', [ProductCategoryController, 'getProductByCategoryNameJson'])
      .as('productCategories.getProductByCategoryNameJson')

    router.get('/:id', [ProductCategoryController, 'detail']).as('productCategories.detail')
    router.get('/:id/edit', [ProductCategoryController, 'edit'])
    router.patch('/:id', [ProductCategoryController, 'postEdit']).as('productCategories.postEdit')
    router.delete('/:id', [ProductCategoryController, 'postDelete']).as('productCategories.delete')
  })
  .prefix('/admin/product-categories')
  .middleware(middleware.role(UserRole.ADMIN))

router
  .group(() => {
    router.get('/', [FileManagerController, 'list']).as('fileManagers.list')
    router.delete('/:id', [FileManagerController, 'destroy']).as('fileManagers.delete')
    router.post('/upload', [FileManagerController, 'upload']).as('fileManagers.upload')
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

    router.get('/:id', [ProductController, 'detail']).as('products.detail')
    router.patch('/:id', [ProductController, 'postUpdate']).as('products.postEdit')
    router
      .patch('/:id/update-is-available', [ProductController, 'updateIsAvailable'])
      .as('products.postUpdateIsAvailable')
    router.delete('/:id', [ProductController, 'postDelete']).as('products.delete')
  })
  .prefix('/admin/products')
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
    router.get('/', [OfferController, 'index']).as('offers.index')
    router.get('/create', [OfferController, 'create']).as('offers.create')
    router.post('/create', [OfferController, 'postCreate']).as('offers.postCreate')
    router.get('/:id/edit', [OfferController, 'edit']).as('offers.edit')
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
