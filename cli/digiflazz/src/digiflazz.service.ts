import axios, { AxiosHeaders, type AxiosInstance, isAxiosError } from 'axios'
import * as cheerio from 'cheerio'
import type {
  Cookie,
  ProductBrandResponse,
  ProductCategoryDetailResponse,
  ProductCategoryResponse,
  ProductSellerResponse,
  ProductTypeResponse,
  UpdateMultipleRequestData,
} from './digiflazz.type'
import { DigiflazzException } from './exception'

export class DigiflazzService {
  private client: AxiosInstance
  private cookies: Cookie[] = []
  private xsrfToken: string | null = null

  private baseHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    pragma: 'no-cache',
    'cache-control': 'no-cache',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'sec-ch-ua-mobile': '?0',
    'x-requested-with': 'XMLHttpRequest',
    dnt: '1',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    referer: 'https://member.digiflazz.com/buyer-area/product',
    'accept-language': 'en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7',
  }

  constructor(cookies: Cookie[], client?: AxiosInstance) {
    if (!cookies || cookies.length === 0) {
      throw new Error('Cookies are required to initialize DigiflazzService')
    }

    this.cookies = cookies

    this.client =
      client ??
      axios.create({
        baseURL: 'https://member.digiflazz.com',
        withCredentials: true,
      })

    this.setupInterceptors()
  }

  /**
   * Inject cookie, UA, dan XSRF otomatis ke setiap request
   */
  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      // pastikan headers adalah AxiosHeaders
      if (!config.headers) {
        config.headers = new AxiosHeaders()
      }

      const headers = config.headers as AxiosHeaders

      // base headers
      Object.entries(this.baseHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })

      // cookie
      headers.set('Cookie', this.cookies.map((c) => `${c.name}=${c.value}`).join('; '))

      // xsrf
      if (this.xsrfToken) {
        headers.set('x-xsrf-token', this.xsrfToken)
      }

      return config
    })
  }

  private async getCsrfToken() {
    try {
      const response = await this.client.get('/buyer-area/product')
      const $ = cheerio.load(response.data)
      return $('meta[name="csrf-token"]').attr('content') ?? null
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Get CSRF token error:', error.message)
      }
      return null
    }
  }

  private getXsrfTokenFromCookie() {
    const cookie = this.cookies.find((c) => c.name === 'XSRF-TOKEN')
    return cookie ? decodeURIComponent(cookie.value) : null
  }

  public async initialize() {
    this.xsrfToken = this.getXsrfTokenFromCookie()

    if (!this.xsrfToken) {
      this.xsrfToken = await this.getCsrfToken()
    }

    if (!this.xsrfToken) {
      throw new Error('Failed to retrieve XSRF-TOKEN')
    }

    console.log('XSRF-TOKEN:', this.xsrfToken)
  }

  public async getProductCategory(): Promise<ProductCategoryResponse> {
    try {
      const response = await this.client.get('/api/v1/buyer/product/category')
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw DigiflazzException.fromAxios(error)
      }

      throw new DigiflazzException('Unexpected error occurred', {
        originalError: error as Error,
      })
    }
  }

  public async getProductBrand(): Promise<ProductBrandResponse> {
    try {
      const response = await this.client.get('/api/v1/buyer/product/brand')
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw DigiflazzException.fromAxios(error)
      }

      throw new DigiflazzException('Unexpected error occurred', {
        originalError: error as Error,
      })
    }
  }

  public async getProductType(): Promise<ProductTypeResponse> {
    try {
      const response = await this.client.get('/api/v1/buyer/product/type')
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw DigiflazzException.fromAxios(error)
      }

      throw new DigiflazzException('Unexpected error occurred', {
        originalError: error as Error,
      })
    }
  }

  //   Detail
  public async getProductCategoryDetail(
    categoryId: string,
  ): Promise<ProductCategoryDetailResponse> {
    try {
      const response = await this.client.get(`/api/v1/buyer/product/category/${categoryId}`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw DigiflazzException.fromAxios(error)
      }

      throw new DigiflazzException('Unexpected error occurred', {
        originalError: error as Error,
      })
    }
  }

  public async getProductSeller(productId: string): Promise<ProductSellerResponse> {
    console.log('Fetching sellers for product ID:', productId)
    try {
      const response = await this.client.get(`/api/v1/buyer/product/seller/${productId}`)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw DigiflazzException.fromAxios(error)
      }

      throw new DigiflazzException('Unexpected error occurred', {
        originalError: error as Error,
      })
    }
  }
  public async updateMultiple(data: UpdateMultipleRequestData): Promise<{
    message: string
  }> {
    try {
      const response = await this.client.post(`/api/v1/buyer/product/update/multiple`, data)
      return response.data
    } catch (error) {
      if (isAxiosError(error)) {
        throw DigiflazzException.fromAxios(error)
      }

      throw new DigiflazzException('Unexpected error occurred', {
        originalError: error as Error,
      })
    }
  }
}
