import { BadRequestException, GatewayTimeoutException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OrderStatus } from '@repo/db/types'
import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'
import {
  DigiflazzApiTopupResponse,
  DigiflazzCallbackData,
  DigiflazzCekTagihanData,
  DigiflazzCekTagihanResponse,
  DigiflazzTopupData,
  DigiflazzTopupResponse,
} from './digiflazz.type'

@Injectable()
export class DigiflazzService {
  private apikey: string
  private username: string
  private callbackSecret: string
  private testing: boolean = false
  private apiClient: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    this.apikey = this.configService.get<string>('DIGIFLAZZ_API_KEY')
    this.username = this.configService.get<string>('DIGIFLAZZ_USERNAME')
    this.callbackSecret = this.configService.get<string>('DIGIFLAZZ_CALLBACK_SECRET')

    const environment = this.configService.get<string>('NODE_ENV')
    this.testing = environment === 'development' || environment === 'test'

    this.apiClient = axios.create({
      baseURL: 'https://api.digiflazz.com/v1',
    })
  }

  async topup(data: DigiflazzTopupData): Promise<DigiflazzTopupResponse> {
    try {
      const sign = this.generateSignature(data.order_id)

      const response = await this.apiClient.post<DigiflazzApiTopupResponse>('/transaction', {
        username: this.username,
        buyer_sku_code: data.provider_code,
        customer_no: data.customer_input,
        ref_id: data.order_id,
        max_price: data.max_price,
        testing: this.testing,
        cb_url: data.callback_url,
        allow_dot: data.allow_dot,
        sign: sign,
      })

      switch (response.data.data.rc) {
        case '00':
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.COMPLETED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          }
        case '01':
          throw new GatewayTimeoutException(`DF: ${response.data.data.message}`)
        case '02':
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.FAILED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          }
        case '03':
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.PENDING,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          }
        case '99':
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.PENDING,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          }
        default:
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.FAILED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(`DF: ${error.response?.data.message}`)
      }

      throw new BadRequestException(`DF: ${error.message}`)
    }
  }

  async cekTagihan(data: DigiflazzCekTagihanData): Promise<DigiflazzCekTagihanResponse> {
    try {
      const sign = this.generateSignature(data.inquiry_id)

      const response = await this.apiClient.post('/transaction', {
        commands: 'inq-pasca',
        username: this.username,
        buyer_sku_code: data.provider_code,
        customer_no: data.customer_input,
        ref_id: data.inquiry_id,
        sign: sign,
      })

      console.log('Digiflazz Cek Tagihan Response:', response.data)

      switch (response.data.data.rc) {
        case '00':
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            status: OrderStatus.COMPLETED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            admin: response.data.data.admin,
            customer_name: response.data.data.customer_name,
            message: response.data.data.message,
            periode: response.data.data.periode,
            price: response.data.data.price,
            selling_price: response.data.data.selling_price,
            inquiry_id: response.data.data.inquiry_id,
            desc: response.data.data.desc,
          }
        case '01':
          throw new GatewayTimeoutException(`DF: ${response.data?.data?.message}`)
        case '02':
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            status: OrderStatus.FAILED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            admin: response.data.data.admin,
            customer_name: response.data.data.customer_name,
            message: response.data.data.message,
            periode: response.data.data.periode,
            price: response.data.data.price,
            selling_price: response.data.data.selling_price,
            inquiry_id: response.data.data.inquiry_id,
            desc: response.data.data.desc,
          }
        case ['03', '99']:
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            status: OrderStatus.PENDING,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            admin: response.data.data.admin,
            customer_name: response.data.data.customer_name,
            message: response.data.data.message,
            periode: response.data.data.periode,
            price: response.data.data.price,
            selling_price: response.data.data.selling_price,
            inquiry_id: response.data.data.inquiry_id,
            desc: response.data.data.desc,
          }
        default:
          return {
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            status: OrderStatus.FAILED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            admin: response.data.data.admin,
            customer_name: response.data.data.customer_name,
            message: response.data.data.message,
            periode: response.data.data.periode,
            price: response.data.data.price,
            selling_price: response.data.data.selling_price,
            inquiry_id: response.data.data.inquiry_id,
            desc: response.data.data.desc,
          }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Digiflazz Cek Tagihan Error Response:', error.response?.data)
        throw new BadRequestException(
          `DF: ${error.response?.data?.message || error.response?.data?.data?.message}`,
        )
      }

      throw new BadRequestException(`DF: ${error.message}`)
    }
  }

  private generateSignature(value: string) {
    return crypto
      .createHash('md5')
      .update(this.username + this.apikey + value)
      .digest('hex')
  }

  public verifyCallbackSignature(
    data: {
      data: DigiflazzCallbackData
    },
    signFromPost: string,
  ) {
    const sign = crypto
      .createHmac('sha1', this.callbackSecret)
      .update(JSON.stringify(data))
      .digest('hex')

    console.log('Generated Sign:', sign, signFromPost)

    return {
      isValid: `sha1=${sign}` === signFromPost,
      sign: sign,
    }
  }
}
