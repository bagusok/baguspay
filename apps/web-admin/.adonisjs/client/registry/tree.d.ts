/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    postRegister: typeof routes['auth.postRegister']
    login: typeof routes['auth.login']
    postLogin: typeof routes['auth.postLogin']
    logout: typeof routes['auth.logout']
  }
  home: {
    index: typeof routes['home.index']
  }
  users: {
    me: typeof routes['users.me']
    index: typeof routes['users.index']
    store: typeof routes['users.store']
    getJson: typeof routes['users.getJson']
    delete: typeof routes['users.delete']
    update: typeof routes['users.update']
    addBalance: typeof routes['users.addBalance']
    deductBalance: typeof routes['users.deductBalance']
  }
  productCategories: {
    index: typeof routes['productCategories.index']
    indexGames: typeof routes['productCategories.indexGames']
    createGame: typeof routes['productCategories.createGame']
    editGame: typeof routes['productCategories.editGame']
    indexPulsa: typeof routes['productCategories.indexPulsa']
    createPulsa: typeof routes['productCategories.createPulsa']
    editPulsa: typeof routes['productCategories.editPulsa']
    indexKuota: typeof routes['productCategories.indexKuota']
    createKuota: typeof routes['productCategories.createKuota']
    editKuota: typeof routes['productCategories.editKuota']
    indexTokenPln: typeof routes['productCategories.indexTokenPln']
    createTokenPln: typeof routes['productCategories.createTokenPln']
    editTokenPln: typeof routes['productCategories.editTokenPln']
    indexEWallet: typeof routes['productCategories.indexEWallet']
    createEWallet: typeof routes['productCategories.createEWallet']
    editEWallet: typeof routes['productCategories.editEWallet']
    indexVoucher: typeof routes['productCategories.indexVoucher']
    createVoucher: typeof routes['productCategories.createVoucher']
    editVoucher: typeof routes['productCategories.editVoucher']
    indexOtherPrepaid: typeof routes['productCategories.indexOtherPrepaid']
    createOtherPrepaid: typeof routes['productCategories.createOtherPrepaid']
    editOtherPrepaid: typeof routes['productCategories.editOtherPrepaid']
    indexPostpaidTagihanPln: typeof routes['productCategories.indexPostpaidTagihanPln']
    createPostpaidTagihanPln: typeof routes['productCategories.createPostpaidTagihanPln']
    editPostpaidTagihanPln: typeof routes['productCategories.editPostpaidTagihanPln']
    indexPostpaidPdam: typeof routes['productCategories.indexPostpaidPDAM']
    createPostpaidPdam: typeof routes['productCategories.createPostpaidPDAM']
    editPostpaidPdam: typeof routes['productCategories.editPostpaidPDAM']
    indexPostpaidInternet: typeof routes['productCategories.indexPostpaidInternet']
    createPostpaidInternet: typeof routes['productCategories.createPostpaidInternet']
    editPostpaidInternet: typeof routes['productCategories.editPostpaidInternet']
    indexPostpaidBpjsKesehatan: typeof routes['productCategories.indexPostpaidBPJSKesehatan']
    createPostpaidBpjsKesehatan: typeof routes['productCategories.createPostpaidBPJSKesehatan']
    editPostpaidBpjsKesehatan: typeof routes['productCategories.editPostpaidBPJSKesehatan']
    indexPostpaidBpjsKetenagakerjaan: typeof routes['productCategories.indexPostpaidBPJSKetenagakerjaan']
    createPostpaidBpjsKetenagakerjaan: typeof routes['productCategories.createPostpaidBPJSKetenagakerjaan']
    editPostpaidBpjsKetenagakerjaan: typeof routes['productCategories.editPostpaidBPJSKetenagakerjaan']
    getProductCategoryByCategoryNameJson: typeof routes['productCategories.getProductCategoryByCategoryNameJson']
    detailWithBillingType: typeof routes['productCategories.detailWithBillingType']
    detail: typeof routes['productCategories.detail']
    postCreate: typeof routes['productCategories.postCreate']
    postEdit: typeof routes['productCategories.postEdit']
    delete: typeof routes['productCategories.delete']
  }
  fileManagers: {
    list: typeof routes['fileManagers.list']
    delete: typeof routes['fileManagers.delete']
    upload: typeof routes['fileManagers.upload']
    uploadMany: typeof routes['fileManagers.uploadMany']
    deleteBulk: typeof routes['fileManagers.deleteBulk']
    getById: typeof routes['fileManagers.getById']
  }
  inputFields: {
    index: typeof routes['inputFields.index']
    postCreate: typeof routes['inputFields.postCreate']
    getAll: typeof routes['inputFields.getAll']
    postConnect: typeof routes['inputFields.postConnect']
    postDisconnect: typeof routes['inputFields.postDisconnect']
    postUpdate: typeof routes['inputFields.postUpdate']
    delete: typeof routes['inputFields.delete']
  }
  productSubCategories: {
    postCreate: typeof routes['productSubCategories.postCreate']
    detail: typeof routes['productSubCategories.detail']
    postUpdate: typeof routes['productSubCategories.postUpdate']
    delete: typeof routes['productSubCategories.delete']
  }
  products: {
    postCreate: typeof routes['products.postCreate']
    getAll: typeof routes['products.getAll']
    getProductByCategoryNameJson: typeof routes['products.getProductByCategoryNameJson']
    exists: typeof routes['products.exists']
    providerMap: typeof routes['products.providerMap']
    detail: typeof routes['products.detail']
    postEdit: typeof routes['products.postEdit']
    postUpdateIsAvailable: typeof routes['products.postUpdateIsAvailable']
    updateProviderPrice: typeof routes['products.updateProviderPrice']
    delete: typeof routes['products.delete']
  }
  providers: {
    digiflazzProducts: typeof routes['providers.digiflazz_products']
  }
  payments: {
    categories: {
      index: typeof routes['payments.categories.index']
      postCreate: typeof routes['payments.categories.postCreate']
      postEdit: typeof routes['payments.categories.postEdit']
      delete: typeof routes['payments.categories.delete']
    }
    methods: {
      index: typeof routes['payments.methods.index']
      postCreate: typeof routes['payments.methods.postCreate']
      getJson: typeof routes['payments.methods.getJson']
      detailPaymentMethod: typeof routes['payments.methods.detailPaymentMethod']
      postEdit: typeof routes['payments.methods.postEdit']
      delete: typeof routes['payments.methods.delete']
    }
  }
  offers: {
    indexVoucher: typeof routes['offers.indexVoucher']
    createVoucher: typeof routes['offers.createVoucher']
    editVoucher: typeof routes['offers.editVoucher']
    indexDiscount: typeof routes['offers.indexDiscount']
    createDiscount: typeof routes['offers.createDiscount']
    editDiscount: typeof routes['offers.editDiscount']
    indexFlashSale: typeof routes['offers.indexFlashSale']
    createFlashSale: typeof routes['offers.createFlashSale']
    editFlashSale: typeof routes['offers.editFlashSale']
    used: typeof routes['offers.used']
    postCreate: typeof routes['offers.postCreate']
    postUpdate: typeof routes['offers.postUpdate']
    delete: typeof routes['offers.delete']
    connectUser: typeof routes['offers.connectUser']
    disconnectUser: typeof routes['offers.disconnectUser']
    connectProduct: typeof routes['offers.connectProduct']
    disconnectProduct: typeof routes['offers.disconnectProduct']
    connectPaymentMethod: typeof routes['offers.connectPaymentMethod']
    disconnectPaymentMethod: typeof routes['offers.disconnectPaymentMethod']
    getOfferUsers: typeof routes['offers.getOfferUsers']
    getOfferProducts: typeof routes['offers.getOfferProducts']
    getOfferPaymentMethods: typeof routes['offers.getOfferPaymentMethods']
  }
  deposits: {
    index: typeof routes['deposits.index']
    getById: typeof routes['deposits.getById']
    changeStatus: typeof routes['deposits.changeStatus']
  }
  order: {
    index: typeof routes['order.index']
    indexPrepaid: typeof routes['order.indexPrepaid']
    getById: typeof routes['order.getById']
    changePaymentStatus: typeof routes['order.changePaymentStatus']
    changeOrderStatus: typeof routes['order.changeOrderStatus']
    changeRefundStatus: typeof routes['order.changeRefundStatus']
    refundOrder: typeof routes['order.refundOrder']
  }
  balanceMutations: {
    index: typeof routes['balanceMutations.index']
  }
  configFastMenu: {
    index: typeof routes['configFastMenu.index']
    postCreate: typeof routes['configFastMenu.postCreate']
    connectProductToSection: typeof routes['configFastMenu.connectProductToSection']
    bulkConnectProductToSection: typeof routes['configFastMenu.bulkConnectProductToSection']
    disconnectProductFromSection: typeof routes['config_fast_menu.disconnect_product_from_section']
    detail: typeof routes['configFastMenu.detail']
    postEdit: typeof routes['configFastMenu.postEdit']
    postDelete: typeof routes['configFastMenu.postDelete']
  }
  configHomes: {
    index: typeof routes['configHomes.index']
    postCreate: typeof routes['configHomes.postCreate']
    connectProductToSection: typeof routes['configHomes.connectProductToSection']
    bulkConnectProductToSection: typeof routes['configHomes.bulkConnectProductToSection']
    disconnectProductFromSection: typeof routes['config_homes.disconnect_product_from_section']
    detail: typeof routes['configHomes.detail']
    postEdit: typeof routes['configHomes.postEdit']
    postDelete: typeof routes['configHomes.postDelete']
  }
  banners: {
    index: typeof routes['banners.index']
    postCreate: typeof routes['banners.postCreate']
    delete: typeof routes['banners.delete']
  }
  configSettings: {
    index: typeof routes['config_settings.index']
    update: typeof routes['config_settings.update']
  }
  pages: {
    index: typeof routes['pages.index']
    create: typeof routes['pages.create']
    store: typeof routes['pages.store']
    edit: typeof routes['pages.edit']
    update: typeof routes['pages.update']
    destroy: typeof routes['pages.destroy']
  }
  articleCategories: {
    index: typeof routes['articleCategories.index']
    store: typeof routes['articleCategories.store']
    getJson: typeof routes['articleCategories.getJson']
    update: typeof routes['articleCategories.update']
    destroy: typeof routes['articleCategories.destroy']
  }
  articles: {
    index: typeof routes['articles.index']
    create: typeof routes['articles.create']
    store: typeof routes['articles.store']
    edit: typeof routes['articles.edit']
    update: typeof routes['articles.update']
    destroy: typeof routes['articles.destroy']
    togglePublish: typeof routes['articles.togglePublish']
    toggleFeatured: typeof routes['articles.toggleFeatured']
  }
}
