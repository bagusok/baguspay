import { OrderStatus } from '@repo/db/types'

export type DigiflazzTopupData = {
  provider_code: string
  customer_input: string
  order_id: string
  max_price: number
  callback_url?: string
  allow_dot: boolean
}

export type DigiflazzBayarTagihanData = {
  provider_code: string
  customer_input: string
  inquiry_id: string
  order_id: string
}

export type DigiflazzCekTagihanData = {
  inquiry_id: string
  provider_code: string
  customer_input: string // especially SAMSAT format "KodePembayaran,NomorIdentitas"
  year?: number // Optional, only for PBB
  amount?: number // Optional, only for Emoney
}

export type DigiflazzTopupResponse = {
  provider_code: string
  customer_input: string
  order_id: string
  max_price: number
  callback_url?: string
  allow_dot: boolean
  status: OrderStatus
  buyer_last_saldo: number
  provider_price: number
  wa: string
  tele: string
  sn: string | null
  raw: any
}

export type DigiflazzBayarTagihanResponse = {
  provider_code: string
  customer_input: string
  order_id: string
  inquiry_id: string
  max_price: number
  callback_url?: string
  allow_dot: boolean
  status: OrderStatus
  buyer_last_saldo: number
  provider_price: number
  wa: string
  tele: string
  sn: string | null
  customer_name: string
  admin: number
  message: string
  periode: string
  price: number
  selling_price: number
  desc: TagihanPLNDesc | BPJSTK | null
  raw: any
}

export interface DigiflazzCekTagihanResponse {
  inquiry_id: string
  customer_input: string
  customer_name: string
  provider_code: string
  admin: number
  message: string
  status: OrderStatus
  periode: string
  buyer_last_saldo: number
  price: number
  selling_price: number
  desc: TagihanPLNDesc | BPJSTK | null
}

export interface TagihanPLNDesc {
  tarif: string
  daya: number
  lembar_tagihan: number
  detail: TagihanPLNDetail[]
}

export interface TagihanPLNDetail {
  periode: string
  nilai_tagihan: string
  admin: string
  denda: string
}

export interface BPJSTK {
  lembar_tagihan: number
  kode_iuran: string
  jht: number
  jkk: number
  jkm: number
  jpk: number
  jpn: number
  npp: string
  kode_divisi: string
}

export type DigiflazzApiTopupResponse = {
  data: {
    ref_id: string
    customer_no: string
    buyer_sku_code: string
    message: string
    rc: string
    status: 'Pending' | 'Success' | 'Gagal'
    sn: string
    buyer_last_saldo: number
    price: number
    tele: string
    wa: string
  }
}

export type DigiflazzPrepaidCallbackData = {
  data: {
    ref_id: string
    customer_no: string
    buyer_sku_code: string
    message: string
    rc: string
    status: 'Pending' | 'Sukses' | 'Gagal'
    sn: string
    buyer_last_saldo: number
    price: number
    tele: string
    wa: string
  }
}

export type DigiflazzPostpaidCallbackData = {
  data: {
    ref_id: string
    customer_no: string
    customer_name: string
    buyer_sku_code: string
    admin: number
    message: string
    status: string
    rc: string
    sn: string
    periode: string
    buyer_last_saldo: number
    price: number
    selling_price: number
    desc: TagihanPLNDesc | BPJSTK | null
  }
}
