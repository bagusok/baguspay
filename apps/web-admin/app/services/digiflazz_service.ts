import crypto from 'node:crypto'
import { inject } from '@adonisjs/core'
import { type AxiosInstance, isAxiosError } from 'axios'
import env from '#start/env'

@inject()
export class DigiflazzService {
  private apiClient: AxiosInstance
  private username: string
  private apiKey: string

  constructor(axios: AxiosInstance) {
    this.apiClient = axios.create({
      baseURL: 'https://api.digiflazz.com/v1',
    })
    this.username = env.get('DIGIFLAZZ_USERNAME')
    this.apiKey = env.get('DIGIFLAZZ_API_KEY')
  }

  public async checkSaldo() {
    try {
      const response = await this.apiClient.post('/cek-saldo', {
        cmd: 'deposit',
        username: this.username,
        sign: this.generateSignature('depo'),
      })

      return {
        saldo: response.data.data.deposit,
      }
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Digiflazz API Error: ${error.response?.data?.message || error.message}`)
      }

      throw error
    }
  }

  public async getProduct(
    billingType: 'prepaid' | 'postpaid',
    data?: {
      category?: string
      brand?: string
      type?: string
    },
  ): Promise<DigiflazzGetProductResponse> {
    try {
      const response = await this.apiClient.post('/price-list', {
        cmd: billingType,
        username: this.username,
        sign: this.generateSignature('price-list'),
        ...data,
      })

      console.log(response.data)

      // If data.rc exists and is not '00', it's an error. If data.rc does not exist, data is the array (success)
      if (
        response.data?.data &&
        typeof response.data.data === 'object' &&
        'rc' in response.data.data &&
        response.data.data.rc !== '00'
      ) {
        throw new Error(`Digiflazz API Error: ${response.data.data.message}`)
      }

      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Digiflazz API Error: ${error.response?.data?.message || error?.message}`)
      }

      console.error(error)

      throw error
    }
  }

  private generateSignature(value: string) {
    return crypto.createHash('md5').update(`${this.username}${this.apiKey}${value}`).digest('hex')
  }
}

export interface DigiflazzGetProductResponse {
  data: DigiflazzProductPrepaid[] | DigiflazzProductPostpaid[]
}

export interface DigiflazzProductPrepaid {
  product_name: string
  category: string
  brand: string
  type: string
  seller_name: string
  price: number
  buyer_sku_code: string
  buyer_product_status: boolean
  seller_product_status: boolean
  unlimited_stock: boolean
  stock: number
  multi: boolean
  start_cut_off: string
  end_cut_off: string
  desc: string
}

export interface DigiflazzProductPostpaid {
  product_name: string
  category: string
  brand: string
  seller_name: string
  admin: number
  commission: number
  buyer_sku_code: string
  buyer_product_status: boolean
  seller_product_status: boolean
  desc: string
}
