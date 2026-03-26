import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.postRegister': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.postLogin': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'users.me': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.getJson': { paramsTuple?: []; params?: {} }
    'users.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.addBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.deductBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.index': { paramsTuple?: []; params?: {} }
    'productCategories.indexGames': { paramsTuple?: []; params?: {} }
    'productCategories.createGame': { paramsTuple?: []; params?: {} }
    'productCategories.editGame': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPulsa': { paramsTuple?: []; params?: {} }
    'productCategories.createPulsa': { paramsTuple?: []; params?: {} }
    'productCategories.editPulsa': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexKuota': { paramsTuple?: []; params?: {} }
    'productCategories.createKuota': { paramsTuple?: []; params?: {} }
    'productCategories.editKuota': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexTokenPln': { paramsTuple?: []; params?: {} }
    'productCategories.createTokenPln': { paramsTuple?: []; params?: {} }
    'productCategories.editTokenPln': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexEWallet': { paramsTuple?: []; params?: {} }
    'productCategories.createEWallet': { paramsTuple?: []; params?: {} }
    'productCategories.editEWallet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexVoucher': { paramsTuple?: []; params?: {} }
    'productCategories.createVoucher': { paramsTuple?: []; params?: {} }
    'productCategories.editVoucher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexOtherPrepaid': { paramsTuple?: []; params?: {} }
    'productCategories.createOtherPrepaid': { paramsTuple?: []; params?: {} }
    'productCategories.editOtherPrepaid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidTagihanPln': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidTagihanPln': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidTagihanPln': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidPDAM': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidPDAM': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidPDAM': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidInternet': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidInternet': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidInternet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidBPJSKesehatan': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidBPJSKesehatan': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidBPJSKesehatan': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidBPJSKetenagakerjaan': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidBPJSKetenagakerjaan': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidBPJSKetenagakerjaan': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.getProductCategoryByCategoryNameJson': { paramsTuple?: []; params?: {} }
    'productCategories.detailWithBillingType': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'billingType': ParamValue,'type': ParamValue,'id': ParamValue} }
    'productCategories.detail': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'productCategories.postCreate': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'productCategories.postEdit': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'productCategories.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'fileManagers.list': { paramsTuple?: []; params?: {} }
    'fileManagers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fileManagers.upload': { paramsTuple?: []; params?: {} }
    'fileManagers.uploadMany': { paramsTuple?: []; params?: {} }
    'fileManagers.deleteBulk': { paramsTuple?: []; params?: {} }
    'fileManagers.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.index': { paramsTuple?: []; params?: {} }
    'inputFields.postCreate': { paramsTuple?: []; params?: {} }
    'inputFields.getAll': { paramsTuple?: []; params?: {} }
    'inputFields.postConnect': { paramsTuple?: []; params?: {} }
    'inputFields.postDisconnect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.postUpdate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productSubCategories.postCreate': { paramsTuple?: []; params?: {} }
    'productSubCategories.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productSubCategories.postUpdate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productSubCategories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.postCreate': { paramsTuple?: []; params?: {} }
    'products.getAll': { paramsTuple?: []; params?: {} }
    'products.getProductByCategoryNameJson': { paramsTuple?: []; params?: {} }
    'products.exists': { paramsTuple?: []; params?: {} }
    'products.providerMap': { paramsTuple?: []; params?: {} }
    'products.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.postUpdateIsAvailable': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.updateProviderPrice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'providers.digiflazz_products': { paramsTuple?: []; params?: {} }
    'payments.categories.index': { paramsTuple?: []; params?: {} }
    'payments.categories.postCreate': { paramsTuple?: []; params?: {} }
    'payments.categories.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.categories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.methods.index': { paramsTuple?: []; params?: {} }
    'payments.methods.postCreate': { paramsTuple?: []; params?: {} }
    'payments.methods.getJson': { paramsTuple?: []; params?: {} }
    'payments.methods.detailPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.methods.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.methods.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexVoucher': { paramsTuple?: []; params?: {} }
    'offers.createVoucher': { paramsTuple?: []; params?: {} }
    'offers.editVoucher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexDiscount': { paramsTuple?: []; params?: {} }
    'offers.createDiscount': { paramsTuple?: []; params?: {} }
    'offers.editDiscount': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexFlashSale': { paramsTuple?: []; params?: {} }
    'offers.createFlashSale': { paramsTuple?: []; params?: {} }
    'offers.editFlashSale': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.used': { paramsTuple?: []; params?: {} }
    'offers.postCreate': { paramsTuple?: []; params?: {} }
    'offers.postUpdate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.connectUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.disconnectUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.connectProduct': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.disconnectProduct': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.connectPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.disconnectPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferUsers': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferProducts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferPaymentMethods': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.index': { paramsTuple?: []; params?: {} }
    'deposits.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.changeStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.index': { paramsTuple?: []; params?: {} }
    'order.indexPrepaid': { paramsTuple?: []; params?: {} }
    'order.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.changePaymentStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.changeOrderStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.changeRefundStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.refundOrder': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'balanceMutations.index': { paramsTuple?: []; params?: {} }
    'configFastMenu.index': { paramsTuple?: []; params?: {} }
    'configFastMenu.postCreate': { paramsTuple?: []; params?: {} }
    'configFastMenu.connectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.bulkConnectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'config_fast_menu.disconnect_product_from_section': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.postDelete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.index': { paramsTuple?: []; params?: {} }
    'configHomes.postCreate': { paramsTuple?: []; params?: {} }
    'configHomes.connectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.bulkConnectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'config_homes.disconnect_product_from_section': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.postDelete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'banners.index': { paramsTuple?: []; params?: {} }
    'banners.postCreate': { paramsTuple?: []; params?: {} }
    'banners.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'config_settings.index': { paramsTuple?: []; params?: {} }
    'config_settings.update': { paramsTuple?: []; params?: {} }
    'pages.index': { paramsTuple?: []; params?: {} }
    'pages.create': { paramsTuple?: []; params?: {} }
    'pages.store': { paramsTuple?: []; params?: {} }
    'pages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'pages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articleCategories.index': { paramsTuple?: []; params?: {} }
    'articleCategories.store': { paramsTuple?: []; params?: {} }
    'articleCategories.getJson': { paramsTuple?: []; params?: {} }
    'articleCategories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articleCategories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.index': { paramsTuple?: []; params?: {} }
    'articles.create': { paramsTuple?: []; params?: {} }
    'articles.store': { paramsTuple?: []; params?: {} }
    'articles.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.togglePublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.toggleFeatured': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'users.me': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.getJson': { paramsTuple?: []; params?: {} }
    'productCategories.index': { paramsTuple?: []; params?: {} }
    'productCategories.indexGames': { paramsTuple?: []; params?: {} }
    'productCategories.createGame': { paramsTuple?: []; params?: {} }
    'productCategories.editGame': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPulsa': { paramsTuple?: []; params?: {} }
    'productCategories.createPulsa': { paramsTuple?: []; params?: {} }
    'productCategories.editPulsa': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexKuota': { paramsTuple?: []; params?: {} }
    'productCategories.createKuota': { paramsTuple?: []; params?: {} }
    'productCategories.editKuota': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexTokenPln': { paramsTuple?: []; params?: {} }
    'productCategories.createTokenPln': { paramsTuple?: []; params?: {} }
    'productCategories.editTokenPln': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexEWallet': { paramsTuple?: []; params?: {} }
    'productCategories.createEWallet': { paramsTuple?: []; params?: {} }
    'productCategories.editEWallet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexVoucher': { paramsTuple?: []; params?: {} }
    'productCategories.createVoucher': { paramsTuple?: []; params?: {} }
    'productCategories.editVoucher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexOtherPrepaid': { paramsTuple?: []; params?: {} }
    'productCategories.createOtherPrepaid': { paramsTuple?: []; params?: {} }
    'productCategories.editOtherPrepaid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidTagihanPln': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidTagihanPln': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidTagihanPln': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidPDAM': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidPDAM': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidPDAM': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidInternet': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidInternet': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidInternet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidBPJSKesehatan': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidBPJSKesehatan': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidBPJSKesehatan': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidBPJSKetenagakerjaan': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidBPJSKetenagakerjaan': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidBPJSKetenagakerjaan': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.getProductCategoryByCategoryNameJson': { paramsTuple?: []; params?: {} }
    'productCategories.detailWithBillingType': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'billingType': ParamValue,'type': ParamValue,'id': ParamValue} }
    'productCategories.detail': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'fileManagers.list': { paramsTuple?: []; params?: {} }
    'fileManagers.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.index': { paramsTuple?: []; params?: {} }
    'inputFields.getAll': { paramsTuple?: []; params?: {} }
    'productSubCategories.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.getAll': { paramsTuple?: []; params?: {} }
    'products.getProductByCategoryNameJson': { paramsTuple?: []; params?: {} }
    'products.exists': { paramsTuple?: []; params?: {} }
    'products.providerMap': { paramsTuple?: []; params?: {} }
    'products.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'providers.digiflazz_products': { paramsTuple?: []; params?: {} }
    'payments.categories.index': { paramsTuple?: []; params?: {} }
    'payments.methods.index': { paramsTuple?: []; params?: {} }
    'payments.methods.getJson': { paramsTuple?: []; params?: {} }
    'payments.methods.detailPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexVoucher': { paramsTuple?: []; params?: {} }
    'offers.createVoucher': { paramsTuple?: []; params?: {} }
    'offers.editVoucher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexDiscount': { paramsTuple?: []; params?: {} }
    'offers.createDiscount': { paramsTuple?: []; params?: {} }
    'offers.editDiscount': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexFlashSale': { paramsTuple?: []; params?: {} }
    'offers.createFlashSale': { paramsTuple?: []; params?: {} }
    'offers.editFlashSale': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.used': { paramsTuple?: []; params?: {} }
    'offers.getOfferUsers': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferProducts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferPaymentMethods': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.index': { paramsTuple?: []; params?: {} }
    'deposits.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.index': { paramsTuple?: []; params?: {} }
    'order.indexPrepaid': { paramsTuple?: []; params?: {} }
    'order.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'balanceMutations.index': { paramsTuple?: []; params?: {} }
    'configFastMenu.index': { paramsTuple?: []; params?: {} }
    'configFastMenu.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.index': { paramsTuple?: []; params?: {} }
    'configHomes.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'banners.index': { paramsTuple?: []; params?: {} }
    'config_settings.index': { paramsTuple?: []; params?: {} }
    'pages.index': { paramsTuple?: []; params?: {} }
    'pages.create': { paramsTuple?: []; params?: {} }
    'pages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articleCategories.index': { paramsTuple?: []; params?: {} }
    'articleCategories.getJson': { paramsTuple?: []; params?: {} }
    'articles.index': { paramsTuple?: []; params?: {} }
    'articles.create': { paramsTuple?: []; params?: {} }
    'articles.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'users.me': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.getJson': { paramsTuple?: []; params?: {} }
    'productCategories.index': { paramsTuple?: []; params?: {} }
    'productCategories.indexGames': { paramsTuple?: []; params?: {} }
    'productCategories.createGame': { paramsTuple?: []; params?: {} }
    'productCategories.editGame': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPulsa': { paramsTuple?: []; params?: {} }
    'productCategories.createPulsa': { paramsTuple?: []; params?: {} }
    'productCategories.editPulsa': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexKuota': { paramsTuple?: []; params?: {} }
    'productCategories.createKuota': { paramsTuple?: []; params?: {} }
    'productCategories.editKuota': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexTokenPln': { paramsTuple?: []; params?: {} }
    'productCategories.createTokenPln': { paramsTuple?: []; params?: {} }
    'productCategories.editTokenPln': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexEWallet': { paramsTuple?: []; params?: {} }
    'productCategories.createEWallet': { paramsTuple?: []; params?: {} }
    'productCategories.editEWallet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexVoucher': { paramsTuple?: []; params?: {} }
    'productCategories.createVoucher': { paramsTuple?: []; params?: {} }
    'productCategories.editVoucher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexOtherPrepaid': { paramsTuple?: []; params?: {} }
    'productCategories.createOtherPrepaid': { paramsTuple?: []; params?: {} }
    'productCategories.editOtherPrepaid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidTagihanPln': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidTagihanPln': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidTagihanPln': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidPDAM': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidPDAM': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidPDAM': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidInternet': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidInternet': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidInternet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidBPJSKesehatan': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidBPJSKesehatan': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidBPJSKesehatan': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.indexPostpaidBPJSKetenagakerjaan': { paramsTuple?: []; params?: {} }
    'productCategories.createPostpaidBPJSKetenagakerjaan': { paramsTuple?: []; params?: {} }
    'productCategories.editPostpaidBPJSKetenagakerjaan': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.getProductCategoryByCategoryNameJson': { paramsTuple?: []; params?: {} }
    'productCategories.detailWithBillingType': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'billingType': ParamValue,'type': ParamValue,'id': ParamValue} }
    'productCategories.detail': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'fileManagers.list': { paramsTuple?: []; params?: {} }
    'fileManagers.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.index': { paramsTuple?: []; params?: {} }
    'inputFields.getAll': { paramsTuple?: []; params?: {} }
    'productSubCategories.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.getAll': { paramsTuple?: []; params?: {} }
    'products.getProductByCategoryNameJson': { paramsTuple?: []; params?: {} }
    'products.exists': { paramsTuple?: []; params?: {} }
    'products.providerMap': { paramsTuple?: []; params?: {} }
    'products.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'providers.digiflazz_products': { paramsTuple?: []; params?: {} }
    'payments.categories.index': { paramsTuple?: []; params?: {} }
    'payments.methods.index': { paramsTuple?: []; params?: {} }
    'payments.methods.getJson': { paramsTuple?: []; params?: {} }
    'payments.methods.detailPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexVoucher': { paramsTuple?: []; params?: {} }
    'offers.createVoucher': { paramsTuple?: []; params?: {} }
    'offers.editVoucher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexDiscount': { paramsTuple?: []; params?: {} }
    'offers.createDiscount': { paramsTuple?: []; params?: {} }
    'offers.editDiscount': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.indexFlashSale': { paramsTuple?: []; params?: {} }
    'offers.createFlashSale': { paramsTuple?: []; params?: {} }
    'offers.editFlashSale': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.used': { paramsTuple?: []; params?: {} }
    'offers.getOfferUsers': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferProducts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.getOfferPaymentMethods': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.index': { paramsTuple?: []; params?: {} }
    'deposits.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.index': { paramsTuple?: []; params?: {} }
    'order.indexPrepaid': { paramsTuple?: []; params?: {} }
    'order.getById': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'balanceMutations.index': { paramsTuple?: []; params?: {} }
    'configFastMenu.index': { paramsTuple?: []; params?: {} }
    'configFastMenu.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.index': { paramsTuple?: []; params?: {} }
    'configHomes.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'banners.index': { paramsTuple?: []; params?: {} }
    'config_settings.index': { paramsTuple?: []; params?: {} }
    'pages.index': { paramsTuple?: []; params?: {} }
    'pages.create': { paramsTuple?: []; params?: {} }
    'pages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articleCategories.index': { paramsTuple?: []; params?: {} }
    'articleCategories.getJson': { paramsTuple?: []; params?: {} }
    'articles.index': { paramsTuple?: []; params?: {} }
    'articles.create': { paramsTuple?: []; params?: {} }
    'articles.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.postRegister': { paramsTuple?: []; params?: {} }
    'auth.postLogin': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.addBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.deductBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.postCreate': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'fileManagers.upload': { paramsTuple?: []; params?: {} }
    'fileManagers.uploadMany': { paramsTuple?: []; params?: {} }
    'fileManagers.deleteBulk': { paramsTuple?: []; params?: {} }
    'inputFields.postCreate': { paramsTuple?: []; params?: {} }
    'inputFields.postConnect': { paramsTuple?: []; params?: {} }
    'productSubCategories.postCreate': { paramsTuple?: []; params?: {} }
    'products.postCreate': { paramsTuple?: []; params?: {} }
    'payments.categories.postCreate': { paramsTuple?: []; params?: {} }
    'payments.methods.postCreate': { paramsTuple?: []; params?: {} }
    'offers.postCreate': { paramsTuple?: []; params?: {} }
    'offers.connectUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.disconnectUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.connectProduct': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.disconnectProduct': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.connectPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.disconnectPaymentMethod': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.refundOrder': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.postCreate': { paramsTuple?: []; params?: {} }
    'configFastMenu.connectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.bulkConnectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'config_fast_menu.disconnect_product_from_section': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.postCreate': { paramsTuple?: []; params?: {} }
    'configHomes.connectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.bulkConnectProductToSection': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'config_homes.disconnect_product_from_section': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'banners.postCreate': { paramsTuple?: []; params?: {} }
    'pages.store': { paramsTuple?: []; params?: {} }
    'articleCategories.store': { paramsTuple?: []; params?: {} }
    'articles.store': { paramsTuple?: []; params?: {} }
    'articles.togglePublish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.toggleFeatured': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'users.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'fileManagers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.postDisconnect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inputFields.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productSubCategories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.categories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.methods.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.postDelete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.postDelete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'banners.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articleCategories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productCategories.postEdit': { paramsTuple: [ParamValue,ParamValue]; params: {'type': ParamValue,'id': ParamValue} }
    'inputFields.postUpdate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'productSubCategories.postUpdate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.postUpdateIsAvailable': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.updateProviderPrice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.categories.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.methods.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.postUpdate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.changeStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.changePaymentStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.changeOrderStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'order.changeRefundStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configFastMenu.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'configHomes.postEdit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'config_settings.update': { paramsTuple?: []; params?: {} }
    'pages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articleCategories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}