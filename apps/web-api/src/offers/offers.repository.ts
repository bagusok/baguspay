import { Injectable } from '@nestjs/common'
import { and, eq, gte, lt, lte, or, sql } from '@repo/db'
import { OfferType, OrderStatus, PaymentStatus, tb } from '@repo/db/types'
import { DBInstance } from 'src/common/types/db-instance'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class OffersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllGlobalOffers() {
    const offers = await this.databaseService.db.query.offers.findMany({
      where: and(eq(tb.offers.is_available, true)),
    })

    return offers
  }

  async findOfferAvailableByProductId(productId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const offers = await db
      .select({
        id: tb.offers.id,
        name: tb.offers.name,
        is_new_user: tb.offers.is_new_user,
        discount_percentage: tb.offers.discount_percentage,
        discount_static: tb.offers.discount_static,
        discount_maximum: tb.offers.discount_maximum,
        min_amount: tb.offers.min_amount,
        is_available: tb.offers.is_available,
        is_deleted: tb.offers.is_deleted,
        quota: tb.offers.quota,
        start_date: tb.offers.start_date,
        end_date: tb.offers.end_date,
        offer_product_id: tb.offer_products.id,
        type: tb.offers.type,
        is_combinable_with_voucher: tb.offers.is_combinable_with_voucher,
        is_all_users: tb.offers.is_all_users,
        is_all_payment_methods: tb.offers.is_all_payment_methods,
        code: tb.offers.code,
        usage_limit: tb.offers.usage_limit,
        usage_count: tb.offers.usage_count,
      })
      .from(tb.offers)
      .leftJoin(
        tb.offer_products,
        and(
          eq(tb.offer_products.product_id, productId),
          eq(tb.offer_products.offer_id, tb.offers.id),
        ),
      )
      .where(
        and(
          or(eq(tb.offer_products.product_id, productId), eq(tb.offers.is_all_products, true)),
          eq(tb.offers.is_available, true),
          eq(tb.offers.is_deleted, false),
          gte(tb.offers.quota, 0),
          lte(tb.offers.start_date, new Date()),
          gte(tb.offers.end_date, new Date()),

          eq(tb.offers.type, OfferType.DISCOUNT),
        ),
      )

    return offers
  }

  async findVoucherAvailableById(voucherId: string, productId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const now = new Date()

    const [offer] = await db
      .select({
        id: tb.offers.id,
        name: tb.offers.name,
        is_new_user: tb.offers.is_new_user,
        discount_percentage: tb.offers.discount_percentage,
        discount_static: tb.offers.discount_static,
        discount_maximum: tb.offers.discount_maximum,
        min_amount: tb.offers.min_amount,
        is_available: tb.offers.is_available,
        is_deleted: tb.offers.is_deleted,
        quota: tb.offers.quota,
        start_date: tb.offers.start_date,
        end_date: tb.offers.end_date,
        // offer_product_id: tb.offer_products.id,
        type: tb.offers.type,
        is_combinable_with_voucher: tb.offers.is_combinable_with_voucher,
        is_all_users: tb.offers.is_all_users,
        is_all_payment_methods: tb.offers.is_all_payment_methods,
        code: tb.offers.code,
        usage_limit: tb.offers.usage_limit,
        usage_count: tb.offers.usage_count,
      })
      .from(tb.offers)
      .innerJoin(
        tb.offer_products,
        and(
          eq(tb.offer_products.offer_id, tb.offers.id),
          eq(tb.offer_products.product_id, productId),
        ),
      )
      .where(
        and(
          eq(tb.offers.id, voucherId),
          eq(tb.offers.is_available, true),
          eq(tb.offers.is_deleted, false),
          lt(tb.offers.usage_count, tb.offers.quota),
          lte(tb.offers.start_date, now),
          gte(tb.offers.end_date, now),
          eq(tb.offers.type, OfferType.VOUCHER),
        ),
      )
      .limit(1)

    return offer
  }

  async findVoucherAvailableByCode(code: string, productId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const now = new Date()

    const [offer] = await db
      .select({
        id: tb.offers.id,
        name: tb.offers.name,
        is_new_user: tb.offers.is_new_user,
        discount_percentage: tb.offers.discount_percentage,
        discount_static: tb.offers.discount_static,
        discount_maximum: tb.offers.discount_maximum,
        min_amount: tb.offers.min_amount,
        is_available: tb.offers.is_available,
        is_deleted: tb.offers.is_deleted,
        quota: tb.offers.quota,
        start_date: tb.offers.start_date,
        end_date: tb.offers.end_date,
        offer_product_id: tb.offer_products.id,
        type: tb.offers.type,
        is_combinable_with_voucher: tb.offers.is_combinable_with_voucher,
        is_all_users: tb.offers.is_all_users,
        is_all_payment_methods: tb.offers.is_all_payment_methods,
        code: tb.offers.code,
        usage_limit: tb.offers.usage_limit,
        usage_count: tb.offers.usage_count,
      })
      .from(tb.offers)
      .innerJoin(
        tb.offer_products,
        and(
          eq(tb.offer_products.offer_id, tb.offers.id),
          eq(tb.offer_products.product_id, productId),
        ),
      )
      .where(
        and(
          eq(tb.offers.code, code),
          eq(tb.offers.is_available, true),
          eq(tb.offers.is_deleted, false),
          lt(tb.offers.usage_count, tb.offers.quota),
          lte(tb.offers.start_date, now),
          gte(tb.offers.end_date, now),
          eq(tb.offers.type, OfferType.VOUCHER),
        ),
      )
      .limit(1)

    return offer
  }

  async findUserOfferPolicy(offerId: string, userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const offerPolicies = await db.query.offerUsers.findFirst({
      columns: {
        id: true,
      },
      where: and(eq(tb.offerUsers.offer_id, offerId), eq(tb.offerUsers.user_id, userId)),
    })

    return offerPolicies
  }

  async getUsageOfferByUserCount(offerId: string, userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const [usageCount] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(tb.offerOnOrders)
      .innerJoin(tb.orders, eq(tb.offerOnOrders.order_id, tb.orders.id))
      .where(
        and(
          eq(tb.offerOnOrders.offer_id, offerId),
          eq(tb.offerOnOrders.user_id, userId),
          or(
            // kondisi payment status valid
            or(
              eq(tb.orders.payment_status, PaymentStatus.PENDING),
              eq(tb.orders.payment_status, PaymentStatus.SUCCESS),
            ),

            // kondisi order status valid (dan bukan NONE)
            or(
              eq(tb.orders.order_status, OrderStatus.PENDING),
              eq(tb.orders.order_status, OrderStatus.COMPLETED),
            ),
          ),
        ),
      )

    return usageCount?.count ?? 0
  }

  async incrementOfferUsageCount(offerId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    await db
      .update(tb.offers)
      .set({
        usage_count: sql`${tb.offers.usage_count} + 1`,
      })
      .where(eq(tb.offers.id, offerId))
  }

  async decrementOfferUsageCount(offerId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    await db
      .update(tb.offers)
      .set({
        usage_count: sql`${tb.offers.usage_count} - 1`,
      })
      .where(eq(tb.offers.id, offerId))
  }

  async aplyOfferToOrder(offerId: string, orderId: string, userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    await db.insert(tb.offerOnOrders).values({
      offer_id: offerId,
      order_id: orderId,
      user_id: userId,
    })
  }
}
