/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, gte, lt, lte, or } from '@repo/db';
import { OfferType, tb } from '@repo/db/types';
import { TUser } from 'src/common/types/meta.type';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { RedeemVoucherDto } from './offers.dto';

@Injectable()
export class OffersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async redeemVoucher(data: RedeemVoucherDto, user: TUser) {
    const products = await this.databaseService.db.query.products.findFirst({
      where: and(
        eq(tb.products.id, data.product_id),
        eq(tb.products.is_available, true),
      ),
    });

    if (!products) {
      throw new NotFoundException('Product not found or unavailable');
    }

    const paymentMethod =
      await this.databaseService.db.query.paymentMethods.findFirst({
        where: and(
          eq(tb.paymentMethods.id, data.payment_method_id),
          eq(tb.paymentMethods.is_available, true),
        ),
      });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found or unavailable');
    }

    const offer = await this.databaseService.db.query.offers.findFirst({
      where: and(
        eq(tb.offers.code, data.code),
        lt(tb.offers.usage_count, tb.offers.quota),
        eq(tb.offers.is_available, true),
        eq(tb.offers.type, OfferType.VOUCHER),
        lte(tb.offers.start_date, new Date()),
        gte(tb.offers.end_date, new Date()),
        eq(tb.offers.is_deleted, false),
      ),
      columns: {
        id: true,
        name: true,
        sub_name: true,
        label: true,
        image_url: true,
        code: true,
        description: true,
        discount_static: true,
        discount_percentage: true,
        discount_maximum: true,
        usage_limit: true,
        quota: true,
        start_date: true,
        end_date: true,
        is_all_payment_methods: true,
        is_all_products: true,
        is_available: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found or unavailable');
    }

    // check usage per user
    const [usage] = await this.databaseService.db
      .select({
        count: count(),
      })
      .from(tb.offerUsers)
      .where(
        and(
          eq(tb.offerUsers.offer_id, offer.id),
          eq(tb.offerUsers.user_id, user.id),
        ),
      );

    if (usage.count >= offer.usage_limit) {
      throw new NotAcceptableException(
        'You have reached the usage limit for this offer',
      );
    }

    if (!offer.is_all_payment_methods) {
      const isValidPaymentMethod =
        await this.databaseService.db.query.offerPaymentMethods.findFirst({
          where: and(
            eq(tb.offerPaymentMethods.offer_id, offer.id),
            eq(tb.offerPaymentMethods.payment_method_id, paymentMethod.id),
          ),
        });

      if (!isValidPaymentMethod) {
        throw new NotAcceptableException(
          'This offer is not valid for the selected payment method',
        );
      }
    }

    if (!offer.is_all_products) {
      const isValidProduct =
        await this.databaseService.db.query.offer_products.findFirst({
          where: and(
            eq(tb.offer_products.offer_id, offer.id),
            eq(tb.offer_products.product_id, products.id),
          ),
        });

      if (!isValidProduct) {
        throw new NotAcceptableException(
          'This offer is not valid for the selected product',
        );
      }
    }

    return SendResponse.success(offer);
  }

  async getApplicableOffers(
    productId: string,
    user: TUser,
    productPrice: number,
  ) {
    const offers = await this.databaseService.db
      .select({
        id: tb.offers.id,
        name: tb.offers.name,
        type: tb.offers.type,
        discount_percentage: tb.offers.discount_percentage,
        discount_static: tb.offers.discount_static,
        discount_maximum: tb.offers.discount_maximum,
        quota: tb.offers.quota,
        usage_count: tb.offers.usage_count,
        start_date: tb.offers.start_date,
        end_date: tb.offers.end_date,
        is_all_products: tb.offers.is_all_products,
        is_all_users: tb.offers.is_all_users,
        is_combinable_with_voucher: tb.offers.is_combinable_with_voucher,
        min_amount: tb.offers.min_amount,
      })
      .from(tb.offers)
      .leftJoin(
        tb.offer_products,
        and(
          eq(tb.offer_products.offer_id, tb.offers.id),
          eq(tb.offer_products.product_id, productId),
        ),
      )
      .where(
        and(
          or(
            eq(tb.offers.is_all_products, true),
            eq(tb.offer_products.product_id, productId),
          ),
          eq(tb.offers.is_deleted, false),
          eq(tb.offers.is_available, true),
          gte(tb.offers.end_date, new Date()),
          lte(tb.offers.start_date, new Date()),
          lte(tb.offers.min_amount, productPrice),
          or(
            eq(tb.offers.type, OfferType.DISCOUNT),
            eq(tb.offers.type, OfferType.FLASH_SALE),
          ),
        ),
      );

    // Filter tambahan berdasarkan kuota
    const validOffers = offers.filter((o) => o.usage_count < o.quota);

    return validOffers;
  }

  async getVoucher(voucherId: string, productId: string, user: TUser) {
    const [voucher] = await this.databaseService.db
      .select({
        id: tb.offers.id,
        name: tb.offers.name,
        type: tb.offers.type,
        discount_percentage: tb.offers.discount_percentage,
        discount_static: tb.offers.discount_static,
        discount_maximum: tb.offers.discount_maximum,
        is_all_users: tb.offers.is_all_users,
        is_all_products: tb.offers.is_all_products,
        quota: tb.offers.quota,
        usage_count: tb.offers.usage_count,
        is_combinable_with_voucher: tb.offers.is_combinable_with_voucher,
      })
      .from(tb.offers)
      .leftJoin(
        tb.offer_products,
        and(
          eq(tb.offer_products.offer_id, tb.offers.id),
          eq(tb.offer_products.product_id, productId),
        ),
      )
      .where(
        and(
          eq(tb.offers.id, voucherId),
          or(
            eq(tb.offers.is_all_products, true),
            eq(tb.offer_products.product_id, productId),
          ),
          eq(tb.offers.type, OfferType.VOUCHER),
          eq(tb.offers.is_deleted, false),
          eq(tb.offers.is_available, true),
        ),
      )
      .limit(1);

    if (!voucher) {
      throw new NotFoundException(
        `Voucher not found or not valid for this product`,
      );
    }

    // check usage quota
    if (voucher.usage_count >= voucher.quota) {
      throw new NotAcceptableException(`Voucher quota exhausted`);
    }

    // check user eligibility
    if (!voucher.is_all_users) {
      const [voucherUser] = await this.databaseService.db
        .select({
          id: tb.offerUsers.id,
        })
        .from(tb.offerUsers)
        .where(
          and(
            eq(tb.offerUsers.offer_id, voucher.id),
            eq(tb.offerUsers.user_id, user?.id),
          ),
        )
        .limit(1);

      if (!voucherUser) {
        throw new BadRequestException(`This voucher is not available for you`);
      }
    }

    return voucher;
  }

  /**
   * Hitung total diskon berdasarkan offer + voucher
   */
  calculateDiscount(
    price: number,
    offer?: any,
    voucher?: any,
  ): {
    totalDiscount: number;
    offerDiscount: number;
    voucherDiscount: number;
  } {
    let offerDiscount = 0;
    let voucherDiscount = 0;

    // --- Offer (flash sale, discount, global)
    if (offer) {
      offerDiscount =
        Math.round(
          (price * (offer.discount_percentage ?? 0)) / 100 +
            (offer.discount_static ?? 0),
        ) || 0;

      if (offer.discount_maximum && offerDiscount > offer.discount_maximum)
        offerDiscount = offer.discount_maximum;
    }

    // --- Voucher
    if (voucher) {
      voucherDiscount =
        Math.round(
          (price * (voucher.discount_percentage ?? 0)) / 100 +
            (voucher.discount_static ?? 0),
        ) || 0;

      if (
        voucher.discount_maximum &&
        voucherDiscount > voucher.discount_maximum
      )
        voucherDiscount = voucher.discount_maximum;
    }

    const totalDiscount = offerDiscount + voucherDiscount;
    return { totalDiscount, offerDiscount, voucherDiscount };
  }

  /**
   * Validasi kombinasi offer dan voucher
   */
  validateCombinable(offer?: any, voucher?: any) {
    if (!offer || !voucher) return true;

    if (!offer.is_combinable_with_voucher) {
      throw new BadRequestException(
        `Offer "${offer.name}" cannot be combined with voucher.`,
      );
    }
  }
}
