/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.register': {
    methods: ["GET","HEAD"]
    pattern: '/auth/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
    }
  }
  'auth.postRegister': {
    methods: ["POST"]
    pattern: '/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['postRegister']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['postRegister']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
    }
  }
  'auth.postLogin': {
    methods: ["POST"]
    pattern: '/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['postLogin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['postLogin']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.logout': {
    methods: ["GET","HEAD"]
    pattern: '/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'home.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
    }
  }
  'users.me': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['me']>>>
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').userQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/admin/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.getJson': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/get-json'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').userQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['getUsersJson']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['getUsersJson']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.delete': {
    methods: ["DELETE"]
    pattern: '/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.update': {
    methods: ["PATCH"]
    pattern: '/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['postUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['postUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.addBalance': {
    methods: ["POST"]
    pattern: '/admin/users/:id/add-balance'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').addBalanceValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').addBalanceValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['addBalance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['addBalance']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.deductBalance': {
    methods: ["POST"]
    pattern: '/admin/users/:id/deduct-balance'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deductBalanceValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deductBalanceValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/user').deleteUserParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['deductBalance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['deductBalance']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexGames': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/game'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexGames']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexGames']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createGame': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/game/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createGames']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createGames']>>>
    }
  }
  'productCategories.editGame': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/game/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editGames']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editGames']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexPulsa': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/pulsa'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexPulsa']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexPulsa']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createPulsa': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/pulsa/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createPulsa']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createPulsa']>>>
    }
  }
  'productCategories.editPulsa': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/pulsa/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editPulsa']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editPulsa']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexKuota': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/kuota'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexKuota']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexKuota']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createKuota': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/kuota/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createKuota']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createKuota']>>>
    }
  }
  'productCategories.editKuota': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/kuota/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editKuota']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editKuota']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexTokenPln': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/token-pln'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexTokenPln']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexTokenPln']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createTokenPln': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/token-pln/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createTokenPln']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createTokenPln']>>>
    }
  }
  'productCategories.editTokenPln': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/token-pln/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editTokenPln']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editTokenPln']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexEWallet': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/e-wallet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexEWallet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexEWallet']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createEWallet': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/e-wallet/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createEWallet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createEWallet']>>>
    }
  }
  'productCategories.editEWallet': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/e-wallet/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editEWallet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editEWallet']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexVoucher': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/voucher'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexVoucher']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexVoucher']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createVoucher': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/voucher/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createVoucher']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createVoucher']>>>
    }
  }
  'productCategories.editVoucher': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/voucher/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editVoucher']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editVoucher']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexOtherPrepaid': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/other-prepaid'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexOtherPrepaid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['indexOtherPrepaid']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createOtherPrepaid': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/other-prepaid/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createOtherPrepaid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['createOtherPrepaid']>>>
    }
  }
  'productCategories.editOtherPrepaid': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/other-prepaid/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editOtherPrepaid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['editOtherPrepaid']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexPostpaidTagihanPln': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/tagihan-pln'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexTagihanPLN']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexTagihanPLN']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createPostpaidTagihanPln': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/tagihan-pln/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createTagihanPLN']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createTagihanPLN']>>>
    }
  }
  'productCategories.editPostpaidTagihanPln': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/tagihan-pln/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editTagihanPLN']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editTagihanPLN']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexPostpaidPDAM': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/pdam'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexPDAM']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexPDAM']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createPostpaidPDAM': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/pdam/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createPDAM']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createPDAM']>>>
    }
  }
  'productCategories.editPostpaidPDAM': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/pdam/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editPDAM']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editPDAM']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexPostpaidInternet': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/internet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexInternet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexInternet']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createPostpaidInternet': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/internet/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createInternet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createInternet']>>>
    }
  }
  'productCategories.editPostpaidInternet': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/internet/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editInternet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editInternet']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexPostpaidBPJSKesehatan': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/bpjs-kesehatan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexBPJSKesehatan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexBPJSKesehatan']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createPostpaidBPJSKesehatan': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/bpjs-kesehatan/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createBPJSKesehatan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createBPJSKesehatan']>>>
    }
  }
  'productCategories.editPostpaidBPJSKesehatan': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/bpjs-kesehatan/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editBPJSKesehatan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editBPJSKesehatan']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.indexPostpaidBPJSKetenagakerjaan': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/bpjs-ketenagakerjaan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexBPJSKetenagakerjaan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['indexBPJSKetenagakerjaan']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.createPostpaidBPJSKetenagakerjaan': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/bpjs-ketenagakerjaan/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createBPJSKetenagakerjaan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['createBPJSKetenagakerjaan']>>>
    }
  }
  'productCategories.editPostpaidBPJSKetenagakerjaan': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/postpaid/bpjs-ketenagakerjaan/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editBPJSKetenagakerjaan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_postpaid_controller').default['editBPJSKetenagakerjaan']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.getProductCategoryByCategoryNameJson': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/get-json'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['getProductCategoryByCategoryNameJson']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['getProductCategoryByCategoryNameJson']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.detailWithBillingType': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/:billingType/:type/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { billingType: ParamValue; type: ParamValue; id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['detail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['detail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.detail': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-categories/:type/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { type: ParamValue; id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['detail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['detail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.postCreate': {
    methods: ["POST"]
    pattern: '/admin/product-categories/:type/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').createProductCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { type: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').createProductCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.postEdit': {
    methods: ["PATCH"]
    pattern: '/admin/product-categories/:type/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProductCategoryValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { type: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProductCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['postEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['postEdit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productCategories.delete': {
    methods: ["DELETE"]
    pattern: '/admin/product-categories/:type/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { type: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoryIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_categories_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fileManagers.list': {
    methods: ["GET","HEAD"]
    pattern: '/admin/file-managers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').listFileQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['list']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['list']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fileManagers.delete': {
    methods: ["DELETE"]
    pattern: '/admin/file-managers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').deleteFileValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').deleteFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fileManagers.upload': {
    methods: ["POST"]
    pattern: '/admin/file-managers/upload'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').uploadFileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').uploadFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['upload']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['upload']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fileManagers.uploadMany': {
    methods: ["POST"]
    pattern: '/admin/file-managers/upload-many'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').uploadFilesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').uploadFilesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['uploadMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['uploadMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fileManagers.deleteBulk': {
    methods: ["POST"]
    pattern: '/admin/file-managers/delete-bulk'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').deleteFilesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').deleteFilesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['destroyBulk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['destroyBulk']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'fileManagers.getById': {
    methods: ["GET","HEAD"]
    pattern: '/admin/file-managers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/file_manager').deleteFileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['getById']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/file_managers_controller').default['getById']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inputFields.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/input-fields'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['index']>>>
    }
  }
  'inputFields.postCreate': {
    methods: ["POST"]
    pattern: '/admin/input-fields'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').createInputFieldValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').createInputFieldValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inputFields.getAll': {
    methods: ["GET","HEAD"]
    pattern: '/admin/input-fields/all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['getAllInputFields']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['getAllInputFields']>>>
    }
  }
  'inputFields.postConnect': {
    methods: ["POST"]
    pattern: '/admin/input-fields/connect'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').connectInputFieldValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').connectInputFieldValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postConnect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postConnect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inputFields.postDisconnect': {
    methods: ["DELETE"]
    pattern: '/admin/input-fields/disconnect/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').inputIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').inputIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postDisconnect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postDisconnect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inputFields.postUpdate': {
    methods: ["PATCH"]
    pattern: '/admin/input-fields/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').updateInputFieldValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').updateInputFieldValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inputFields.delete': {
    methods: ["DELETE"]
    pattern: '/admin/input-fields/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').inputIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/input_field').inputIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/input_fields_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productSubCategories.postCreate': {
    methods: ["POST"]
    pattern: '/admin/product-sub-categories'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').createProductSubCategoryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').createProductSubCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productSubCategories.detail': {
    methods: ["GET","HEAD"]
    pattern: '/admin/product-sub-categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['detail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['detail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productSubCategories.postUpdate': {
    methods: ["PATCH"]
    pattern: '/admin/product-sub-categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProductSubCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProductSubCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['postUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['postUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'productSubCategories.delete': {
    methods: ["DELETE"]
    pattern: '/admin/product-sub-categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_sub_categories_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.postCreate': {
    methods: ["POST"]
    pattern: '/admin/products'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').createProductValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').createProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.getAll': {
    methods: ["GET","HEAD"]
    pattern: '/admin/products/all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').getAllProductsQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getAll']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getAll']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.getProductByCategoryNameJson': {
    methods: ["GET","HEAD"]
    pattern: '/admin/products/get-json'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productCategoriesQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getProductByCategoryNameJson']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getProductByCategoryNameJson']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.exists': {
    methods: ["GET","HEAD"]
    pattern: '/admin/products/existing'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getExistingProviderCodes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getExistingProviderCodes']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.providerMap': {
    methods: ["GET","HEAD"]
    pattern: '/admin/products/provider-map'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getProviderMap']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['getProviderMap']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.detail': {
    methods: ["GET","HEAD"]
    pattern: '/admin/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['detail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['detail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.postEdit': {
    methods: ["PATCH"]
    pattern: '/admin/products/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProductValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['postUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['postUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.postUpdateIsAvailable': {
    methods: ["PATCH"]
    pattern: '/admin/products/:id/update-is-available'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('@vinejs/vine').default)['object']>|InferInput<(typeof import('@vinejs/vine').default)['boolean']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('@vinejs/vine').default)['object']>|InferInput<(typeof import('@vinejs/vine').default)['boolean']>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['updateIsAvailable']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['updateIsAvailable']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.updateProviderPrice': {
    methods: ["PATCH"]
    pattern: '/admin/products/:id/update-provider-price'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProviderPriceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').updateProviderPriceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['updateProviderPrice']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['updateProviderPrice']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.delete': {
    methods: ["DELETE"]
    pattern: '/admin/products/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/product').productIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'providers.digiflazz_products': {
    methods: ["GET","HEAD"]
    pattern: '/admin/providers/digiflazz/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/providers_controller').default['digiflazzProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/providers_controller').default['digiflazzProducts']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.categories.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/payments/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['indexCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['indexCategory']>>>
    }
  }
  'payments.categories.postCreate': {
    methods: ["POST"]
    pattern: '/admin/payments/categories'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').createPayementMethodCategoryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').createPayementMethodCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postCreateCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postCreateCategory']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.categories.postEdit': {
    methods: ["PATCH"]
    pattern: '/admin/payments/categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').updatePayementMethodCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').updatePayementMethodCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postUpdateCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postUpdateCategory']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.categories.delete': {
    methods: ["DELETE"]
    pattern: '/admin/payments/categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postDeleteCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postDeleteCategory']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.methods.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/payments/methods'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentMethodsQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['indexPaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['indexPaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.methods.postCreate': {
    methods: ["POST"]
    pattern: '/admin/payments/methods'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').createPaymentMethodsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').createPaymentMethodsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postCreatePaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postCreatePaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.methods.getJson': {
    methods: ["GET","HEAD"]
    pattern: '/admin/payments/methods/get-json'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentMethodsQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['getPaymentMethodJson']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['getPaymentMethodJson']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.methods.detailPaymentMethod': {
    methods: ["GET","HEAD"]
    pattern: '/admin/payments/methods/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['detailPaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['detailPaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.methods.postEdit': {
    methods: ["PATCH"]
    pattern: '/admin/payments/methods/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').updatePaymentMethodsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').updatePaymentMethodsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postUpdatePaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postUpdatePaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments.methods.delete': {
    methods: ["DELETE"]
    pattern: '/admin/payments/methods/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/payments').paymentIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postDeletePaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['postDeletePaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.indexVoucher': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/voucher'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['indexVoucher']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['indexVoucher']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.createVoucher': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/voucher/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['createVoucher']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['createVoucher']>>>
    }
  }
  'offers.editVoucher': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/voucher/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['editVoucher']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['editVoucher']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.indexDiscount': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/discount'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['indexDiscount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['indexDiscount']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.createDiscount': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/discount/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['createDiscount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['createDiscount']>>>
    }
  }
  'offers.editDiscount': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/discount/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['editDiscount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['editDiscount']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.indexFlashSale': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/flash-sale'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['indexFlashSale']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['indexFlashSale']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.createFlashSale': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/flash-sale/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['createFlashSale']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['createFlashSale']>>>
    }
  }
  'offers.editFlashSale': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/flash-sale/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['editFlashSale']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['editFlashSale']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.used': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').getUsedOfferQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getUsedOffers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getUsedOffers']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.postCreate': {
    methods: ["POST"]
    pattern: '/admin/offers/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').insertOfferValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').insertOfferValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.postUpdate': {
    methods: ["PATCH"]
    pattern: '/admin/offers/:id/edit'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').updateOfferValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').updateOfferValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['postUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['postUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.delete': {
    methods: ["DELETE"]
    pattern: '/admin/offers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.connectUser': {
    methods: ["POST"]
    pattern: '/admin/offers/:id/connect/user'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').addOfferUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').addOfferUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['connectUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['connectUser']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.disconnectUser': {
    methods: ["POST"]
    pattern: '/admin/offers/:id/disconnect/user'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').deleteOfferUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').deleteOfferUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['disconnectUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['disconnectUser']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.connectProduct': {
    methods: ["POST"]
    pattern: '/admin/offers/:id/connect/product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').addOfferProductValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').addOfferProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['connectProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['connectProduct']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.disconnectProduct': {
    methods: ["POST"]
    pattern: '/admin/offers/:id/disconnect/product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').deleteOfferProductValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').deleteOfferProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['disconnectProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['disconnectProduct']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.connectPaymentMethod': {
    methods: ["POST"]
    pattern: '/admin/offers/:id/connect/payment-method'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').addOfferPaymentMethodValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').addOfferPaymentMethodValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['connectPaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['connectPaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.disconnectPaymentMethod': {
    methods: ["POST"]
    pattern: '/admin/offers/:id/disconnect/payment-method'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').deleteOfferPaymentMethodValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').deleteOfferPaymentMethodValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['disconnectPaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['disconnectPaymentMethod']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.getOfferUsers': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/:id/users'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerUserQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getOfferUsers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getOfferUsers']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.getOfferProducts': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/:id/products'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerUserQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getOfferProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getOfferProducts']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.getOfferPaymentMethods': {
    methods: ["GET","HEAD"]
    pattern: '/admin/offers/:id/payment-methods'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/offer').offerUserQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getOfferPaymentMethods']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offer_controller').default['getOfferPaymentMethods']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'deposits.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/deposits'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/deposit').getDepositQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'deposits.getById': {
    methods: ["GET","HEAD"]
    pattern: '/admin/deposits/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/deposit').depositIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['getById']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['getById']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'deposits.changeStatus': {
    methods: ["PATCH"]
    pattern: '/admin/deposits/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/deposit').changeStatusValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/deposit').depositIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/deposit').changeStatusValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/deposit').depositIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['changeStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['changeStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').getOrderQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.indexPrepaid': {
    methods: ["GET","HEAD"]
    pattern: '/admin/orders/prepaid'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').getOrderQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['indexPrepaid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['indexPrepaid']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.getById': {
    methods: ["GET","HEAD"]
    pattern: '/admin/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['getById']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['getById']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.changePaymentStatus': {
    methods: ["PATCH"]
    pattern: '/admin/orders/:id/change-payment-status'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').updateOrderPaymentStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').updateOrderPaymentStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['changePaymentStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['changePaymentStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.changeOrderStatus': {
    methods: ["PATCH"]
    pattern: '/admin/orders/:id/change-order-status'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').updateOrderStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').updateOrderStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['changeOrderStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['changeOrderStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.changeRefundStatus': {
    methods: ["PATCH"]
    pattern: '/admin/orders/:id/change-refund-status'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').updateOrderRefundStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').updateOrderRefundStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['changeRefundStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['changeRefundStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'order.refundOrder': {
    methods: ["POST"]
    pattern: '/admin/orders/:id/refund'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/order').orderIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['refundToBalance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['refundToBalance']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'balanceMutations.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/balance-mutations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/balance_mutation').getBalanceMutationQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/balance_mutations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/balance_mutations_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configFastMenu.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/home/fast-menu'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['index']>>>
    }
  }
  'configFastMenu.postCreate': {
    methods: ["POST"]
    pattern: '/admin/config/home/fast-menu'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').createHomeProductSectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').createHomeProductSectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['createProductSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['createProductSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configFastMenu.connectProductToSection': {
    methods: ["POST"]
    pattern: '/admin/config/home/fast-menu/:id/connect-product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['connectProductToSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['connectProductToSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configFastMenu.bulkConnectProductToSection': {
    methods: ["POST"]
    pattern: '/admin/config/home/fast-menu/:id/bulk-connect-product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').bulkConnectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').bulkConnectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['bulkConnectProductToSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['bulkConnectProductToSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'config_fast_menu.disconnect_product_from_section': {
    methods: ["POST"]
    pattern: '/admin/config/home/fast-menu/:id/disconnect-product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['disconnectProductFromSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['disconnectProductFromSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configFastMenu.detail': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/home/fast-menu/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['detail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['detail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configFastMenu.postEdit': {
    methods: ["PATCH"]
    pattern: '/admin/config/home/fast-menu/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').updateHomeProductSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').updateHomeProductSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['updateProductSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['updateProductSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configFastMenu.postDelete': {
    methods: ["DELETE"]
    pattern: '/admin/config/home/fast-menu/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['deleteProductSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_home_fast_menu').default['deleteProductSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configHomes.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/home/product-sections'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['index']>>>
    }
  }
  'configHomes.postCreate': {
    methods: ["POST"]
    pattern: '/admin/config/home/product-sections'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').createHomeProductSectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').createHomeProductSectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['createProductSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['createProductSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configHomes.connectProductToSection': {
    methods: ["POST"]
    pattern: '/admin/config/home/product-sections/:id/connect-product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['connectProductToSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['connectProductToSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configHomes.bulkConnectProductToSection': {
    methods: ["POST"]
    pattern: '/admin/config/home/product-sections/:id/bulk-connect-product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').bulkConnectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').bulkConnectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['bulkConnectProductToSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['bulkConnectProductToSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'config_homes.disconnect_product_from_section': {
    methods: ["POST"]
    pattern: '/admin/config/home/product-sections/:id/disconnect-product'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').connectProductToSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['disconnectProductFromSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['disconnectProductFromSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configHomes.detail': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/home/product-sections/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['detail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['detail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configHomes.postEdit': {
    methods: ["PATCH"]
    pattern: '/admin/config/home/product-sections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').updateHomeProductSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').updateHomeProductSectionValidator)>|InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['updateProductSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['updateProductSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'configHomes.postDelete': {
    methods: ["DELETE"]
    pattern: '/admin/config/home/product-sections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_home').configHomeIdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['deleteProductSection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/config_homes_controller').default['deleteProductSection']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'banners.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/home/banner'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/banners_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/banners_controller').default['index']>>>
    }
  }
  'banners.postCreate': {
    methods: ["POST"]
    pattern: '/admin/config/home/banner'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/banners').createBannerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/banners').createBannerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/banners_controller').default['postCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/banners_controller').default['postCreate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'banners.delete': {
    methods: ["DELETE"]
    pattern: '/admin/config/home/banner/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/banners_controller').default['postDelete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/banners_controller').default['postDelete']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'config_settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/settings/general'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/settings_controller').default['index']>>>
    }
  }
  'config_settings.update': {
    methods: ["PATCH"]
    pattern: '/admin/config/settings/general'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_settings').updateSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/config_settings').updateSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'pages.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/pages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['index']>>>
    }
  }
  'pages.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/pages/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['create']>>>
    }
  }
  'pages.store': {
    methods: ["POST"]
    pattern: '/admin/config/pages'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/pages').createPageValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/pages').createPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'pages.edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/config/pages/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['edit']>>>
    }
  }
  'pages.update': {
    methods: ["PATCH"]
    pattern: '/admin/config/pages/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/pages').updatePageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/pages').updatePageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'pages.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/config/pages/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/configs/pages_controller').default['destroy']>>>
    }
  }
  'articleCategories.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/blog/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['index']>>>
    }
  }
  'articleCategories.store': {
    methods: ["POST"]
    pattern: '/admin/blog/categories'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').createArticleCategoryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').createArticleCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articleCategories.getJson': {
    methods: ["GET","HEAD"]
    pattern: '/admin/blog/categories/get-json'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['getJson']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['getJson']>>>
    }
  }
  'articleCategories.update': {
    methods: ["PATCH"]
    pattern: '/admin/blog/categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').updateArticleCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').updateArticleCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articleCategories.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/blog/categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/article_categories_controller').default['destroy']>>>
    }
  }
  'articles.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/blog/articles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['index']>>>
    }
  }
  'articles.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/blog/articles/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['create']>>>
    }
  }
  'articles.store': {
    methods: ["POST"]
    pattern: '/admin/blog/articles'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').createArticleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').createArticleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articles.edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/blog/articles/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['edit']>>>
    }
  }
  'articles.update': {
    methods: ["PATCH"]
    pattern: '/admin/blog/articles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').updateArticleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('@vinejs/vine').default)['compile']>|InferInput<(typeof import('#validators/articles').updateArticleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articles.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/blog/articles/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['destroy']>>>
    }
  }
  'articles.togglePublish': {
    methods: ["POST"]
    pattern: '/admin/blog/articles/:id/toggle-publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['togglePublish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['togglePublish']>>>
    }
  }
  'articles.toggleFeatured': {
    methods: ["POST"]
    pattern: '/admin/blog/articles/:id/toggle-featured'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['toggleFeatured']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog/articles_controller').default['toggleFeatured']>>>
    }
  }
}
