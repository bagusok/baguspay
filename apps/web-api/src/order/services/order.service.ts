import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import {
  InquiryStatus,
  OfferType,
  OrderStatus,
  PaymentMethodAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
  PaymentStatus,
  ProductBillingType,
  tb,
  UserRole,
} from '@repo/db/types'

import { arrayContains, eq, gte, lte, ne, SQL } from '@repo/db'
import * as crypto from 'crypto'
import { TUser } from 'src/common/types/meta.type'
import { SendResponse } from 'src/common/utils/response'
import { SignatureUtils } from 'src/common/utils/signature'
import { DatabaseService } from 'src/database/database.service'
import { DigiflazzCekTagihanResponse } from 'src/integrations/h2h/digiflazz/digiflazz.type'
import { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service'
import { OffersRepository } from 'src/offers/offers.repository'
import { OffersService } from 'src/offers/offers.service'
import { ProductRepository } from 'src/products/product.repository'
import { QueueService } from 'src/queue/queue.service'
import { InquiryUniversalDto } from '../dto/inquiry.universal.dto'
import { CheckoutDto, GetOrderHistoryQueryDto, OrderIdDto } from '../dto/order.dto'
import { OrderRepository } from '../order.repository'
import { InquiryService } from './inquiry.service'

@Injectable()
export class OrderService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly pgService: PaymentGatewayService,
    private readonly queueService: QueueService,
    private readonly offerService: OffersService,
    private readonly offerRepository: OffersRepository,
    private readonly inquiryService: InquiryService,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getPricePerPaymentMethod(productId: string, user: TUser) {
    const product = await this.orderRepository.findProductByProductIdForInquiry(productId)

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found OR not available.`)
    }

    if (product.product_category.billing_type !== ProductBillingType.PREPAID) {
      throw new BadRequestException(
        'Price per payment method is only available for prepaid products.',
      )
    }

    const paymentMethodWhere: SQL[] = [
      eq(tb.paymentMethods.is_available, true),
      arrayContains(tb.paymentMethods.allow_access, [PaymentMethodAllowAccess.ORDER]),
      gte(tb.paymentMethods.max_amount, product.price),
      lte(tb.paymentMethods.min_amount, product.price),
      ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
      ne(tb.paymentMethods.provider_name, PaymentMethodProvider.BALANCE),
    ]

    const paymentMethods = await this.orderRepository.findAllPaymentMethods(paymentMethodWhere)

    type PaymentMethodResult = (typeof paymentMethods)[number]

    const groupedPaymentMethods = paymentMethods.reduce((acc, method) => {
      const categoryName = method.payment_method_category.name

      if (!acc.has(categoryName)) {
        acc.set(categoryName, [])
      }

      acc.get(categoryName).push(method)
      return acc
    }, new Map<string, PaymentMethodResult[]>())

    let groupedList = Array.from(groupedPaymentMethods.entries()).map(([name, items]) => ({
      name,
      items: items.map(({ payment_method_category, ...rest }) => {
        const fee = this.calculateFee(product.price, rest.fee_percentage / 100, rest.fee_static)

        return {
          ...rest,
          total_fee: fee,
          total_price: product.price + fee,
        }
      }),
    }))

    return SendResponse.success(groupedList)
  }

  async inquiry(data: InquiryUniversalDto, timestamp: number, user: TUser) {
    const product = await this.orderRepository.findProductByProductIdForInquiry(data.product_id)

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.product_id} not found OR not available.`)
    }

    const inputFields = await this.orderRepository.findInputByProductCategoryId(
      product.product_category.id,
    )

    const { raw, merged } = this.getMergedInputFields(
      inputFields,
      data.input_fields,
      product.provider_input_separator,
    )

    const isPospaid = product.product_category.billing_type === ProductBillingType.POSTPAID

    let inquiryData: DigiflazzCekTagihanResponse | null = null

    // Get Inquiry From Third Party
    if (isPospaid) {
      const getInquiryFromProvider = await this.inquiryService.getInquiryFromProvider({
        billing_type: product.product_category.billing_type,
        inquiry_id: crypto.randomUUID(),
        customer_input: merged,
        product_provider_name: product.provider_name,
        provider_code: product.provider_code,
      })

      inquiryData = getInquiryFromProvider
    }

    const buildPrice = () => {
      if (isPospaid) {
        const detailLen = 'detail' in inquiryData.desc ? (inquiryData.desc.detail?.length ?? 1) : 1

        const profit = product.profit_static * detailLen

        return {
          product_price: inquiryData.price + profit,
          total_price: inquiryData.price + profit,
          cost_price: inquiryData.price,
        }
      }

      return {
        product_price: product.price,
        total_price: product.price,
        cost_price: product.provider_price,
      }
    }

    // ===== Offer / Voucher =====
    const isUseVoucher = !!data.voucher_id

    let dataVoucher = {
      id: '',
      name: '',
      discount_percentage: 0,
      discount_static: 0,
      discount_maximum: 0,
      min_amount: 0,
    }

    let voucherDiscount = 0

    const baseAmount = buildPrice().total_price
    let finalTotal = baseAmount

    // Validate & Calculate Voucher
    if (isUseVoucher) {
      const voucher = await this.offerService.validateVoucher(
        data.voucher_id,
        data.product_id,
        user,
      )

      dataVoucher = {
        id: voucher.id,
        name: voucher.name,
        discount_percentage: voucher.discount_percentage,
        discount_static: voucher.discount_static,
        discount_maximum: voucher.discount_maximum,
        min_amount: voucher.min_amount,
      }

      if (baseAmount < dataVoucher.min_amount) {
        throw new BadRequestException(
          `Minimum amount for this voucher is ${dataVoucher.min_amount}`,
        )
      }

      // percentage first, otherwise static
      if (dataVoucher.discount_percentage > 0) {
        voucherDiscount = Math.floor(baseAmount * (dataVoucher.discount_percentage / 100))
      } else if (dataVoucher.discount_static > 0) {
        voucherDiscount = dataVoucher.discount_static
      }

      if (dataVoucher.discount_maximum > 0) {
        voucherDiscount = Math.min(voucherDiscount, dataVoucher.discount_maximum)
      }

      voucherDiscount = Math.max(0, Math.min(voucherDiscount, baseAmount))
      finalTotal = baseAmount - voucherDiscount
    }
    // ===== End Offer / Voucher =====

    const productSnapshot = await this.orderRepository.createProductSnapshot({
      product_id: product.id,
      name: product.name,
      category_name: product.product_category.name,
      sub_category_name: product.product_sub_category.name,
      price: buildPrice().product_price,
      fullfillment_type: product.fullfillment_type,
      is_special_feature: product.product_category.is_special_feature,
      provider_code: product.provider_code,
      provider_price: buildPrice().cost_price,
      provider_max_price: product.provider_max_price,
      provider_input_separator: product.provider_input_separator,
      provider_ref_id: '',
      special_feature_key: product.product_category.special_feature_key,
      billing_type: product.product_category.billing_type,
      profit_percentage: product.profit_percentage,
      profit_static: product.profit_static,
      provider_name: product.provider_name,
      sku_code: product.sku_code,
    })

    const buildResponse = {
      product: {
        category: product.product_category.name,
        sub_category: product.product_sub_category.name,
        name: product.name,
        price: isPospaid ? baseAmount : product.price,
      },
      bills: isPospaid
        ? {
            jumlah_tagihan: inquiryData.selling_price - inquiryData.admin,
            fee: product.provider_price + product.profit_static,
            customer_name: inquiryData.customer_name,
            ...inquiryData.desc,
          }
        : null,
      offers: isUseVoucher
        ? [
            {
              type: OfferType.VOUCHER,
              name: dataVoucher.name,
              total_discount: voucherDiscount,
            },
          ]
        : [],
      input_fields: raw,
      merged_input: merged,
      product_price: baseAmount,
      discount: voucherDiscount,
      total_price: finalTotal,
    }

    const inquiryExpired = new Date().getTime() + 15 * 60 * 1000

    const inquiry = await this.orderRepository.createInquiry({
      status: InquiryStatus.CONFIRMED,

      cost_price: buildPrice().cost_price,
      discount_price: voucherDiscount,
      price: baseAmount,
      total_price: finalTotal, // final after discount
      fee: 0,
      admin_fee: 0,
      profit: finalTotal - buildPrice().cost_price,
      product_snapshot_id: productSnapshot.id,

      user_id: user.id,
      customer_email: user.email,

      customer_input: raw,
      customer_input_merged: merged,
      customer_name: '',
      customer_phone: data.phone_number,
      inquiry_provider: product.provider_name,

      offer_applied: isUseVoucher ? [{ id: dataVoucher.id, type: OfferType.VOUCHER }] : [],
      expired_at: new Date(inquiryExpired),

      inquiry_response: inquiryData,
      inquiry_provider_code: product.provider_code,
      inquiry_ref_id: inquiryData ? inquiryData.inquiry_id : '',
    })

    const checkoutToken = SignatureUtils.generateCheckoutToken(
      {
        billingType: product.product_category.billing_type,
        timestamp,
        userId: user.id,
        inquiryId: inquiry.id,
        productId: product.id,
        inputFields: buildResponse.input_fields,
        productPrice: buildResponse.product_price,
        discount: buildResponse.discount,
        totalPrice: buildResponse.total_price,
        offers: [...(isUseVoucher ? [{ id: dataVoucher.id, type: OfferType.VOUCHER }] : [])],
      },
      this.configService.get<string>('CHECKOUT_TOKEN_SECRET'),
    )

    return SendResponse.success({
      inquiry_id: inquiry.id,
      ...buildResponse,
      checkout_token: checkoutToken,
      expired_at: inquiry.expired_at,
    })
  }

  async getPaymentMethod(inquiryId: string, user: TUser) {
    const inquiryData = await this.orderRepository.findInquiryById(
      inquiryId,
      user.id,
      InquiryStatus.CONFIRMED,
    )

    if (!inquiryData) {
      throw new NotFoundException(
        `Inquiry with ID ${inquiryId} not found or not valid for payment method retrieval.`,
      )
    }

    const paymentMethodWhere: SQL[] = [
      eq(tb.paymentMethods.is_available, true),
      arrayContains(tb.paymentMethods.allow_access, [PaymentMethodAllowAccess.ORDER]),
      gte(tb.paymentMethods.max_amount, inquiryData.total_price),
      lte(tb.paymentMethods.min_amount, inquiryData.total_price),
      ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
      ne(tb.paymentMethods.provider_name, PaymentMethodProvider.BALANCE),
    ]

    const paymentMethods = await this.orderRepository.findAllPaymentMethods(paymentMethodWhere)

    type PaymentMethodResult = (typeof paymentMethods)[number]

    const groupedPaymentMethods = paymentMethods.reduce((acc, method) => {
      const categoryName = method.payment_method_category.name

      if (!acc.has(categoryName)) {
        acc.set(categoryName, [])
      }

      acc.get(categoryName).push(method)
      return acc
    }, new Map<string, PaymentMethodResult[]>())

    let groupedList = Array.from(groupedPaymentMethods.entries()).map(([name, items]) => ({
      name,
      items: items.map(({ payment_method_category, ...rest }) => {
        const fee = this.calculateFee(
          inquiryData.total_price,
          rest.fee_percentage / 100,
          rest.fee_static,
        )

        return {
          ...rest,
          total_fee: fee,
          total_price: inquiryData.total_price + fee,
        }
      }),
    }))

    return SendResponse.success(groupedList)
  }

  async checkout(
    data: CheckoutDto,
    timestamp: number,
    user: TUser,
    ip: string | null = null,
    userAgent: string | null = null,
  ) {
    const inquiryData = await this.orderRepository.findInquiryById(
      data.inquiry_id,
      user.id,
      InquiryStatus.CONFIRMED,
    )

    if (!inquiryData) {
      throw new NotFoundException(
        `Inquiry with ID ${data.inquiry_id} not found or not valid for checkout.`,
      )
    }

    const paymentMethod = await this.orderRepository.findPaymentMethodById(data.payment_method_id, [
      gte(tb.paymentMethods.max_amount, inquiryData.total_price),
      lte(tb.paymentMethods.min_amount, inquiryData.total_price),
    ])

    if (!paymentMethod) {
      throw new NotFoundException(
        `No valid payment method found for the inquiry with ID ${data.inquiry_id}.`,
      )
    }

    if (
      user.role === UserRole.GUEST &&
      (paymentMethod.type == PaymentMethodType.BALANCE ||
        paymentMethod.provider_name == PaymentMethodProvider.BALANCE)
    ) {
      throw new BadRequestException('Guests are not allowed to use balance as a payment method.')
    }

    const checkoutTokenData = {
      inquiry_id: inquiryData.id,
      product_id: inquiryData.product_snapshot.product_id,
      input_fields: inquiryData.customer_input,
      product_price: inquiryData.price,
      discount: inquiryData.discount_price,
      total_price: inquiryData.total_price,
      offers: inquiryData.offer_applied,
    }
    const verifyCheckoutToken = SignatureUtils.verifyCheckoutToken(
      {
        billingType: inquiryData.product_snapshot.billing_type || ProductBillingType.PREPAID,
        timestamp,
        userId: user.id,
        inquiryId: inquiryData.id,
        productId: inquiryData.product_snapshot.product_id,
        inputFields: checkoutTokenData.input_fields,
        productPrice: checkoutTokenData.product_price,
        discount: checkoutTokenData.discount,
        totalPrice: checkoutTokenData.total_price,
        offers: checkoutTokenData.offers,
      },
      this.configService.get<string>('CHECKOUT_TOKEN_SECRET'),
      data.checkout_token,
    )

    if (!verifyCheckoutToken) {
      throw new BadRequestException('Invalid checkout token.')
    }

    const orderId = this.generateOrderId(user?.id)
    const calculateFee = this.calculateFee(
      inquiryData.total_price,
      paymentMethod.fee_percentage / 100,
      paymentMethod.fee_static,
    )

    const { createPayment, voucherAplied } = await this.databaseService.db.transaction(
      async (tx) => {
        // Validate Voucher
        const voucherAplied = inquiryData.offer_applied.find(
          (offer) => offer.type === OfferType.VOUCHER,
        )

        if (inquiryData.offer_applied.length > 0 && voucherAplied) {
          const validateVoucher = await this.offerService.validateVoucher(
            voucherAplied.id,
            inquiryData.product_snapshot.product_id,
            user,
          )
        }

        // Validate Voucher

        const createPayment = await this.pgService.createPayment({
          user_id: user.id,
          amount: inquiryData.total_price,
          customer_email: user.email,
          customer_phone: inquiryData.customer_phone,
          customer_name: user.name,
          expired_in: paymentMethod.expired_in,
          provider_code: paymentMethod.provider_code,
          fee_in_percent: paymentMethod.fee_percentage,
          fee_static: paymentMethod.fee_static,
          fee_type: paymentMethod.fee_type,
          provider_name: paymentMethod.provider_name,
          id: orderId,
          order_items: [
            {
              name: `${inquiryData.product_snapshot.category_name} - ${inquiryData.product_snapshot.name}`,
              price: inquiryData.total_price + calculateFee,
              quantity: 1,
              product_id: inquiryData.product_snapshot.product_id,
              customer_input: inquiryData.customer_input_merged,
            },
          ],
        })

        const paymentSnapshot = await this.orderRepository.createPaymentSnapshot(
          {
            name: paymentMethod.name,
            payment_method_id: paymentMethod.id,
            type: paymentMethod.type,
            fee_static: paymentMethod.fee_static,
            fee_percentage: paymentMethod.fee_percentage,
            fee_type: paymentMethod.fee_type,
            provider_code: paymentMethod.provider_code,
            provider_name: paymentMethod.provider_name,
            allow_access: paymentMethod.allow_access,
            email: user.email,

            expired_in: paymentMethod.expired_in,
            expired_at: createPayment.expired_at,

            is_need_email: paymentMethod.is_need_email,
            is_need_phone_number: paymentMethod.is_need_phone_number,
            phone_number: data.payment_phone_number,

            provider_ref_id: createPayment.ref_id,
            qr_code: createPayment.qr_code,
            pay_code: createPayment.pay_code,
            pay_url: createPayment.pay_url,
          },
          tx,
        )

        const createOrder = await this.orderRepository.createOrder(
          {
            inquiry_id: inquiryData.id,
            payment_snapshot_id: paymentSnapshot.id,
            product_snapshot_id: inquiryData.product_snapshot_id,
            user_id: user.id,
            price: inquiryData.price,
            total_price: createPayment.amount_total,
            discount_price: inquiryData.discount_price,
            cost_price: inquiryData.product_snapshot.provider_price,
            fee: createPayment.total_fee,
            profit: inquiryData.profit,
            sn_number: '',
            order_id: orderId,
            payment_status: createPayment.status,
            order_status:
              createPayment.status == PaymentStatus.SUCCESS
                ? OrderStatus.PENDING
                : OrderStatus.NONE,
            customer_input: inquiryData.customer_input_merged,
            customer_phone: inquiryData.customer_phone,
            customer_email: inquiryData.customer_email,
            customer_ip: ip,
            customer_ua: userAgent,
          },
          tx,
        )

        if (voucherAplied) {
          await this.offerRepository.aplyOfferToOrder(voucherAplied.id, createOrder.id, user.id, tx)
          await this.offerRepository.incrementOfferUsageCount(voucherAplied.id, tx)
        }

        await this.productRepository.decreaseProductStockByProductId(
          inquiryData.product_snapshot.product_id,
          1,
          tx,
        )

        await this.orderRepository.setInquiryStatus(InquiryStatus.USED, inquiryData.id, tx)

        return { createPayment, voucherAplied }
      },
    )

    // Add queue jobs AFTER transaction commits to ensure order exists in database
    if (createPayment.status == PaymentStatus.SUCCESS) {
      await this.queueService.addOrderJob(orderId)
    }

    if (createPayment.status == PaymentStatus.PENDING) {
      const delay = new Date(createPayment.expired_at).getTime() - Date.now()
      await this.queueService.addExpiredOrderJob(orderId, delay)
    }

    return SendResponse.success({
      order_id: orderId,
      product_name: `${inquiryData.product_snapshot.category_name} - ${inquiryData.product_snapshot.name}`,
      payment_method: `${paymentMethod.type} - ${paymentMethod.name}`,
      amount: createPayment.amount_total,
    })
  }

  async handlePaymentCallback(
    orderId: string,
    paymentStatus: PaymentStatus,
    expectedProvider: PaymentMethodProvider,
  ) {
    const order = await this.orderRepository.findOrderByIdWithRelation(orderId)

    if (!order) {
      throw new NotFoundException('Order not found or already processed')
    }

    if (order.payment_status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Order payment status is not pending or already processed')
    }

    if (order.payment_snapshot.provider_name !== expectedProvider) {
      throw new BadRequestException('Payment Provider not match')
    }

    if (paymentStatus === PaymentStatus.SUCCESS) {
      await this.orderRepository.updatePaymentStatus(order.order_id, PaymentStatus.SUCCESS)
      await this.queueService.addOrderJob(order.order_id)
    } else {
      await this.orderRepository.updatePaymentStatus(order.order_id, PaymentStatus.FAILED)
      await this.productRepository.increaseProductStockByProductId(
        order.product_snapshot.product_id,
        1,
      )

      if (order.offer_on_orders && order.offer_on_orders.length > 0) {
        for (const offerOnOrder of order.offer_on_orders) {
          await this.offerRepository.decrementOfferUsageCount(offerOnOrder.offer.id)
        }
      }
    }

    return {
      orderId: order.order_id,
      status: paymentStatus,
    }
  }

  async getAllHistory(query: GetOrderHistoryQueryDto, user: TUser) {
    const { page = 1, limit = 10 } = query

    const whereConditions = [eq(tb.orders.user_id, user.id)]

    if (query.order_id) {
      whereConditions.push(eq(tb.orders.order_id, query.order_id))
    }

    if (query.order_status) {
      whereConditions.push(eq(tb.orders.order_status, query.order_status))
    }

    if (query.start_date) {
      whereConditions.push(gte(tb.orders.created_at, new Date(query.start_date)))
    }

    if (query.end_date) {
      whereConditions.push(lte(tb.orders.created_at, new Date(query.end_date)))
    }

    const orders = await this.orderRepository.findAllHistory(query, user.id)

    const total = await this.orderRepository.countAllHistory(query, user.id)

    return SendResponse.success(
      orders.map((item) => {
        const { id, product_snapshot, ...rest } = item
        return {
          ...rest,
          product: {
            name: `${product_snapshot.category_name} - ${product_snapshot.name}`,
            billing_type: product_snapshot.billing_type,
          },
        }
      }),
      'Success',
      {
        meta: {
          pagination: {
            total: total,
            total_pages: Math.ceil(total / limit),
            page: page,
            limit: limit,
          },
        },
      },
    )
  }

  async getOrderDetail(data: OrderIdDto, user: TUser) {
    const order = await this.orderRepository.findOrderByIdWithRelation(data.id, [
      eq(tb.orders.user_id, user.id),
    ])
    if (!order) {
      throw new NotFoundException(`Order with ID ${data.id} not found.`)
    }

    if (order.user_id !== user.id) {
      throw new ForbiddenException(`You do not have permission to access this order.`)
    }

    const mapOrderResponse = () => {
      return {
        order_id: order.order_id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        refund_status: order.refund_status,
        price: order.price,
        total_price: order.total_price,
        discount_price: order.discount_price,
        fee: order.fee,
        sn_number: order.sn_number,
        created_at: order.created_at,
        updated_at: order.updated_at,
        customer_input: order.customer_input,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        voucher_code: order.voucher_code,
        product: {
          name: order.product_snapshot?.name,
          category_name: order.product_snapshot?.category_name,
          sub_category_name: order.product_snapshot?.sub_category_name,
          price: order.product_snapshot?.price,
        },

        payment: {
          name: order.payment_snapshot?.name,
          type: order.payment_snapshot?.type,
          qr_code: order.payment_snapshot?.qr_code,
          pay_url: order.payment_snapshot?.pay_url,
          pay_code: order.payment_snapshot?.pay_code,
          expired_at: order.payment_snapshot?.expired_at,
        },

        offers: (order.offer_on_orders || []).map((item: any) => ({
          name: item.offer?.name,
          discount_price: item.offer?.discount_static || 0,
        })),

        user: {
          email: order.user?.email,
          name: order.user?.name,
        },
      }
    }

    return SendResponse.success(mapOrderResponse())
  }

  async cancelOrder(data: OrderIdDto, user: TUser) {
    const order = await this.orderRepository.findOrderById(data.id)

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.id} not found.`)
    }

    if (user.role == UserRole.GUEST) {
      throw new BadRequestException('Guest users cannot cancel orders.')
    }

    if (order.user_id !== user.id) {
      throw new ForbiddenException(`You do not have permission to cancel this order.`)
    }

    if (order.payment_status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Only orders with pending payment status can be cancelled.`)
    }
    await this.orderRepository.updatePaymentStatus(order.order_id, PaymentStatus.CANCELLED)

    return SendResponse.success(null, 'Order cancelled successfully.')
  }

  private generateOrderId(userId?: string): string {
    const prefix = 'T'
    const userPart = userId ? userId.slice(0, 4).toUpperCase() : 'guest'
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase()

    return `${prefix}${userPart}${timestamp}${randomPart}`
  }

  private calculateFee(amountReceived: number, feePercent: number, feeFixed: number): number {
    const total = amountReceived / (1 - feePercent) + feeFixed / (1 - feePercent)
    const fee = total - amountReceived
    return Math.ceil(fee)
  }

  private getMergedInputFields(
    inputFields: {
      name: string
      is_required: boolean
      type: any
      options?: any[]
    }[],
    dataInputFields: { name: string; value: number | string }[] | undefined,
    separator: string,
  ): { raw: any[]; merged: string } {
    inputFields.forEach((input) => {
      if (input.is_required) {
        const found = Array.isArray(dataInputFields)
          ? dataInputFields.find(
              (f) =>
                f.name === input.name &&
                f.value !== undefined &&
                f.value !== null &&
                f.value !== '',
            )
          : undefined
        if (!found) {
          throw new BadRequestException(`Input field ${input.name} is required.`)
        }
      }
    })

    // Build merged string
    const inputValues = inputFields.map((input) => {
      const found = Array.isArray(dataInputFields)
        ? dataInputFields.find((f) => f.name === input.name)
        : undefined
      return found?.value ?? ''
    })
    return {
      raw: Array.isArray(dataInputFields) ? dataInputFields : [],
      merged: inputValues.join(separator),
    }
  }
}
