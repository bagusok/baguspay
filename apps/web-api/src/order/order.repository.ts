import { Injectable } from '@nestjs/common'
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  gte,
  type InferInsertModel,
  lte,
  type SQL,
} from '@repo/db'
import {
  type InquiryStatus,
  type OrderStatus,
  PaymentMethodAllowAccess,
  type PaymentStatus,
  type RefundStatus,
  tb,
} from '@repo/db/types'
import type { DBInstance } from 'src/common/types/db-instance'
import type { DatabaseService } from 'src/database/database.service'
import type { GetOrderHistoryQueryDto } from './dto/order.dto'

@Injectable()
export class OrderRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findProductByProductIdForInquiry(productId: string) {
    const [product] = await this.databaseService.db
      .select({
        id: tb.products.id,
        provider_input_separator: tb.products.provider_input_separator,
        name: tb.products.name,
        price: tb.products.price,
        provider_code: tb.products.provider_code,
        provider_price: tb.products.provider_price,
        provider_max_price: tb.products.provider_max_price,
        billing_type: tb.products.billing_type,
        fullfillment_type: tb.products.fullfillment_type,
        profit_percentage: tb.products.profit_percentage,
        profit_static: tb.products.profit_static,
        provider_name: tb.products.provider_name,
        sku_code: tb.products.sku_code,
        product_category: {
          id: tb.productCategories.id,
          name: tb.productCategories.name,
          billing_type: tb.productCategories.product_billing_type,
          is_special_feature: tb.productCategories.is_special_feature,
          special_feature_key: tb.productCategories.special_feature_key,
        },
        product_sub_category: {
          id: tb.productSubCategories.id,
          name: tb.productSubCategories.name,
        },
      })
      .from(tb.products)
      .innerJoin(
        tb.productSubCategories,
        eq(tb.productSubCategories.id, tb.products.product_sub_category_id),
      )
      .innerJoin(
        tb.productCategories,
        eq(tb.productCategories.id, tb.productSubCategories.product_category_id),
      )
      .where(
        and(
          eq(tb.products.id, productId),
          eq(tb.products.is_available, true),
          eq(tb.productCategories.is_available, true),
          eq(tb.productSubCategories.is_available, true),
          eq(tb.productCategories.is_special_feature, false),
        ),
      )
      .limit(1)
    return product
  }

  async findInputByProductCategoryId(productCategoryId: string) {
    const inputFields = await this.databaseService.db.query.inputOnProductCategory.findMany({
      columns: {
        id: true,
      },
      where: eq(tb.inputOnProductCategory.product_category_id, productCategoryId),
      with: {
        input_field: {
          columns: {
            name: true,
            type: true,
            is_required: true,
            options: true,
          },
        },
      },
      orderBy: asc(tb.inputOnProductCategory.created_at),
    })

    const inputFieldDetails = inputFields.map((item) => item.input_field)

    return inputFieldDetails
  }

  async createProductSnapshot(data: InferInsertModel<typeof tb.productSnapshots>, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const [res] = await db.insert(tb.productSnapshots).values(data).returning({
      id: tb.productSnapshots.id,
    })
    return res
  }

  async createPaymentSnapshot(data: InferInsertModel<typeof tb.paymentSnapshots>, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const [res] = await db.insert(tb.paymentSnapshots).values(data).returning({
      id: tb.paymentSnapshots.id,
    })
    return res
  }

  async createInquiry(data: InferInsertModel<typeof tb.inquiries>, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const [res] = await db.insert(tb.inquiries).values(data).returning({
      id: tb.inquiries.id,
      customer_input: tb.inquiries.customer_input,
      expired_at: tb.inquiries.expired_at,
    })
    return res
  }

  async setInquiryStatus(inquiryStatus: InquiryStatus, inquiryId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return await db
      .update(tb.inquiries)
      .set({
        status: inquiryStatus,
      })
      .where(eq(tb.inquiries.id, inquiryId))
  }

  async findInquiryById(inquiryId: string, userId?: string, status?: InquiryStatus) {
    const inquiryWhereClaus: SQL[] = [
      eq(tb.inquiries.id, inquiryId),
      status && eq(tb.inquiries.status, status),
      userId && eq(tb.inquiries.user_id, userId),
    ]

    const inquiryData = await this.databaseService.db.query.inquiries.findFirst({
      where: and(...inquiryWhereClaus),
      with: {
        product_snapshot: true,
      },
    })

    return inquiryData
  }

  async findAllPaymentMethods(where: SQL[]) {
    return await this.databaseService.db.query.paymentMethods.findMany({
      where: and(...where),
      columns: {
        id: true,
        name: true,
        image_url: true,
        min_amount: true,
        max_amount: true,
        is_available: true,
        is_need_email: true,
        is_need_phone_number: true,
        is_featured: true,
        cut_off_start: true,
        cut_off_end: true,
        fee_percentage: true,
        fee_static: true,
        label: true,
      },
      with: {
        payment_method_category: {
          columns: {
            name: true,
          },
        },
      },
    })
  }

  async findPaymentMethodById(paymentMethodId: string, where?: SQL[]) {
    return await this.databaseService.db.query.paymentMethods.findFirst({
      where: and(
        eq(tb.paymentMethods.id, paymentMethodId),
        eq(tb.paymentMethods.is_available, true),
        arrayContains(tb.paymentMethods.allow_access, [PaymentMethodAllowAccess.ORDER]),
        ...(where || []),
      ),
    })
  }

  async createOrder(data: InferInsertModel<typeof tb.orders>, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const [res] = await db.insert(tb.orders).values(data).returning({
      id: tb.orders.id,
    })
    return res
  }

  async findOrderByIdWithRelation(orderId: string, where: SQL[] = []) {
    const whereClause: SQL[] = [eq(tb.orders.order_id, orderId), ...where]

    const order = await this.databaseService.db.query.orders.findFirst({
      where: whereClause.length > 1 ? and(...whereClause) : whereClause[0],
      with: {
        product_snapshot: {
          columns: {
            product_id: true,
            name: true,
            category_name: true,
            sub_category_name: true,
            price: true,
            provider_ref_id: true,
            fullfillment_type: true,
            billing_type: true,
            provider_name: true,
            provider_code: true,
            provider_price: true,
            provider_max_price: true,
          },
        },
        payment_snapshot: {
          columns: {
            email: true,
            phone_number: true,
            payment_method_id: true,
            qr_code: true,
            type: true,
            pay_url: true,
            pay_code: true,
            name: true,
            fee_type: true,
            fee_static: true,
            fee_percentage: true,
            expired_at: true,

            provider_name: true,
            provider_code: true,
          },
        },
        offer_on_orders: {
          columns: {
            discount_total: true,
          },
          with: {
            offer: {
              columns: {
                id: true,
                name: true,
                type: true,
                discount_percentage: true,
                discount_static: true,
                discount_maximum: true,
              },
            },
          },
        },
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      columns: {
        id: true,
        order_id: true,
        order_status: true,
        inquiry_id: true,
        payment_status: true,
        refund_status: true,
        price: true,
        total_price: true,
        discount_price: true,
        fee: true,
        sn_number: true,
        customer_input: true,
        customer_email: true,
        customer_phone: true,
        user_id: true,
        voucher_code: true,
        notes: true,
        created_at: true,
        updated_at: true,
      },
    })

    return order
  }

  async findOrderByInquiryWithRelation(inquiryId: string, where: SQL[] = []) {
    const whereClause: SQL[] = [eq(tb.orders.inquiry_id, inquiryId), ...where]

    const order = await this.databaseService.db.query.orders.findFirst({
      where: whereClause.length > 1 ? and(...whereClause) : whereClause[0],
      with: {
        product_snapshot: {
          columns: {
            product_id: true,
            name: true,
            category_name: true,
            sub_category_name: true,
            price: true,
            provider_ref_id: true,
            fullfillment_type: true,
            billing_type: true,
            provider_name: true,
            provider_code: true,
            provider_price: true,
            provider_max_price: true,
          },
        },
        payment_snapshot: {
          columns: {
            email: true,
            phone_number: true,
            payment_method_id: true,
            qr_code: true,
            type: true,
            pay_url: true,
            pay_code: true,
            name: true,
            fee_type: true,
            fee_static: true,
            fee_percentage: true,
            expired_at: true,

            provider_name: true,
            provider_code: true,
          },
        },
        offer_on_orders: {
          columns: {
            discount_total: true,
          },
          with: {
            offer: {
              columns: {
                id: true,
                name: true,
                type: true,
                discount_percentage: true,
                discount_static: true,
                discount_maximum: true,
              },
            },
          },
        },
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      columns: {
        id: true,
        order_id: true,
        order_status: true,
        inquiry_id: true,
        payment_status: true,
        refund_status: true,
        price: true,
        total_price: true,
        discount_price: true,
        fee: true,
        sn_number: true,
        customer_input: true,
        customer_email: true,
        customer_phone: true,
        user_id: true,
        voucher_code: true,
        notes: true,
        created_at: true,
        updated_at: true,
      },
    })

    return order
  }

  async findOrderById(orderId: string) {
    const order = await this.databaseService.db.query.orders.findFirst({
      where: and(eq(tb.orders.order_id, orderId)),
      columns: {
        id: true,
        order_id: true,
        order_status: true,
        payment_status: true,
        user_id: true,
        total_price: true,
        fee: true,
      },
    })
    return order
  }

  async findOrderByInquiryId(inquiryId: string) {
    const order = await this.databaseService.db.query.orders.findFirst({
      where: and(eq(tb.orders.inquiry_id, inquiryId)),
      columns: {
        id: true,
        order_id: true,
        order_status: true,
        payment_status: true,
        user_id: true,
        total_price: true,
        fee: true,
      },
    })
    return order
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return await db
      .update(tb.orders)
      .set({
        payment_status: paymentStatus,
      })
      .where(eq(tb.orders.order_id, orderId))
  }

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return await db
      .update(tb.orders)
      .set({
        order_status: orderStatus,
      })
      .where(eq(tb.orders.order_id, orderId))
  }

  async updateOrder(
    orderId: string,
    data: Partial<InferInsertModel<typeof tb.orders>>,
    tx?: DBInstance,
  ) {
    const db = tx ?? this.databaseService.db
    return await db.update(tb.orders).set(data).where(eq(tb.orders.order_id, orderId))
  }

  async updateOrderRefundStatus(orderId: string, refundStatus: RefundStatus, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return await db
      .update(tb.orders)
      .set({
        refund_status: refundStatus,
      })
      .where(eq(tb.orders.order_id, orderId))
  }

  async findAllHistory(query: GetOrderHistoryQueryDto, userId: string) {
    const { page = 1, limit = 10 } = query

    const whereConditions = [eq(tb.orders.user_id, userId)]

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

    const orders = await this.databaseService.db.query.orders.findMany({
      where: and(...whereConditions),
      orderBy: desc(tb.orders.created_at),
      limit: limit,
      offset: (page - 1) * limit,
      columns: {
        id: true,
        order_id: true,
        total_price: true,
        payment_status: true,
        order_status: true,
        refund_status: true,
        created_at: true,
        updated_at: true,
      },
      with: {
        product_snapshot: {
          columns: {
            name: true,
            category_name: true,
            sub_category_name: true,
            billing_type: true,
          },
        },
      },
    })

    return orders
  }

  async countAllHistory(query: GetOrderHistoryQueryDto, userId: string) {
    const whereConditions = [eq(tb.orders.user_id, userId)]

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

    const [total] = await this.databaseService.db
      .select({
        count: count(),
      })
      .from(tb.orders)
      .where(and(...whereConditions))

    return Number(total.count)
  }
}
