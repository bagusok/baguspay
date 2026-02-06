export interface Cookie {
  domain: string
  expirationDate: number
  hostOnly: boolean
  httpOnly: boolean
  name: string
  path: string
  sameSite: string | null
  secure: boolean
  session: boolean
  storeId: string | null
  value: string
}

export interface ProductCategoryResponse {
  data: {
    id: string
    name: string
  }[]
}

export interface ProductBrandResponse {
  data: {
    id: string
    name: string
  }[]
}

export interface ProductTypeResponse {
  data: {
    id: string
    name: string
  }[]
}

export interface ProductCategoryDetailResponse {
  data: ProductCategory[]
}

export interface ProductCategory {
  id: string
  code: string
  max_price: number
  product: string
  product_id: string
  product_details: ProductDetails
  description: string
  price: number
  stock: number
  start_cut_off: string
  end_cut_off: string
  unlimited_stock: boolean
  faktur: boolean
  multi: boolean
  multi_counter: number
  seller: string
  seller_sku_id: string
  seller_sku_id_int: number
  seller_connection_type: string
  seller_sku_code: string
  seller_details: SellerDetails
  status: boolean
  last_update: string
  status_sellerSku: number
  sort_order: number
  seller_sku_desc: string
  change: boolean
}

export interface ProductDetails {
  brand: Brand
  category: Category
  type: Type
}

export interface Brand {
  id: string
}

export interface Category {
  id: string
}

export interface Type {
  id: string
}

export interface SellerDetails {
  faturPajak: boolean
}

export interface ProductSellerResponse {
  data: Seller[]
}

export interface Seller {
  id: string
  id_int: number
  seller: string
  seller_id: string
  is_seller_favorite: boolean
  favorite_order: number
  price: number
  seller_sku_code: string
  stock: number
  start_cut_off: string
  end_cut_off: string
  faktur: boolean
  connectionType: string
  deskripsi: string
  unlimited_stock: boolean
  multi: boolean
  multi_counter: number
  seller_details: SellerDetails
  status_sellerSku: number
  status: boolean
  reviewAvg: number
  rating_qty: string
  full: boolean
}

export interface SellerDetails {
  jamCS: string
  sla: string
  chat_id: string
}

export interface UpdateMultipleRequestData {
  products: Product[]
}

export interface Product {
  id: string
  code: string
  max_price: number
  product: string
  product_id: string
  product_details: ProductDetails
  description: string
  price: number
  stock: number
  start_cut_off: string
  end_cut_off: string
  unlimited_stock: boolean
  faktur: boolean
  multi: boolean
  multi_counter: number
  seller: string
  seller_sku_id: string
  seller_sku_id_int: number
  seller_connection_type: string
  seller_sku_code: string
  seller_details: SellerDetails
  status: boolean
  last_update: string
  status_sellerSku: number
  sort_order: number
  seller_sku_desc: string
  change: boolean
  isDuplicateCode: boolean
  isDuplicateSeller: boolean
}

export interface ProductDetails {
  brand: Brand
  category: Category
  type: Type
}

export interface Brand {
  id: string
}

export interface Category {
  id: string
}

export interface Type {
  id: string
}

export interface SellerDetails {
  jamCS: string
  sla: string
  chat_id: string
}
