import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, gte, lt, lte } from '@repo/db';
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
}
