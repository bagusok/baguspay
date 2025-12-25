import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { InquiryStatus, OfferType, tb } from '@repo/db/types';

import { and, asc, eq } from '@repo/db';
import * as crypto from 'crypto';
import { TUser } from 'src/common/types/meta.type';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service';
import { OffersService } from 'src/offers/offers.service';
import { PaymentsService } from 'src/payments/payments.service';
import { QueueService } from 'src/queue/queue.service';
import { InquiryUniversalDto } from './dtos/inquiry.universal.dto';

@Injectable()
export class OrderV2Service {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly pgService: PaymentGatewayService,
    private readonly queueService: QueueService,
    private readonly offerService: OffersService,
    private readonly paymentService: PaymentsService,
  ) {}

  async inquiry(data: InquiryUniversalDto, timestamp: number, user: TUser) {
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
        eq(
          tb.productCategories.id,
          tb.productSubCategories.product_category_id,
        ),
      )
      .where(
        and(
          eq(tb.products.id, data.product_id),
          eq(tb.products.is_available, true),
          eq(tb.productCategories.is_available, true),
          eq(tb.productSubCategories.is_available, true),
          eq(tb.productCategories.is_special_feature, false),
        ),
      )
      .limit(1);

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${data.product_id} not found OR not available.`,
      );
    }

    const inputFields =
      await this.databaseService.db.query.inputOnProductCategory.findMany({
        columns: {
          id: true,
        },
        where: eq(
          tb.inputOnProductCategory.product_category_id,
          product.product_category.id,
        ),
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
      });

    const inputFieldDetails = inputFields.map((item) => item.input_field);
    const { raw, merged } = this.getMergedInputFields(
      inputFieldDetails,
      data.input_fields,
      product.provider_input_separator,
    );

    // --- Offer & Voucher Logic (mirroring getPriceBy) ---
    // Fetch all relevant offers for this product
    const offers = await this.offerService.getApplicableOffers(
      product.id,
      user,
      product.price,
    );

    const selectedOffer =
      offers.find((o) => o.type === OfferType.FLASH_SALE) || offers[0] || null;

    let selectedVoucher = null;
    if (data.voucher_id) {
      selectedVoucher = await this.offerService.getVoucher(
        data.voucher_id,
        data.product_id,
        user,
      );
      this.offerService.validateCombinable(selectedOffer, selectedVoucher);
    }

    const { totalDiscount, offerDiscount, voucherDiscount } =
      this.offerService.calculateDiscount(
        product.price,
        selectedOffer,
        selectedVoucher,
      );

    const totalPrice = product.price - totalDiscount;

    if (totalPrice < 1000) {
      throw new NotAcceptableException(
        'Total price after discount cannot be less than 1000.',
      );
    }

    const { paymentMethod, fee } =
      await this.paymentService.validatePaymentMethod({
        payment_method_id: data.payment_method_id,
        total_price: totalPrice,
        voucher: selectedVoucher,
        user,
        payment_phone_number: data.payment_phone_number,
      });

    const rawToken = `PREPAID:${JSON.stringify(data)}:${timestamp}:${user.id}`;
    const hashedToken = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('CHECKOUT_TOKEN_SECRET'),
      )
      .update(rawToken)
      .digest('base64url');

    const buildResponse = {
      product: {
        category: product.product_category.name,
        sub_category: product.product_sub_category.name,
        name: product.name,
        price: product.price,
      },
      payment_method: {
        id: paymentMethod.id,
        name: paymentMethod.name,
        type: paymentMethod.type,
      },
      offers: [
        ...(selectedOffer
          ? [
              {
                name: selectedOffer.name,
                type: selectedOffer.type,
                discount_percentage: selectedOffer.discount_percentage,
                discount_static: selectedOffer.discount_static,
                discount_maximum: selectedOffer.discount_maximum,
                total_discount: selectedOffer === null ? 0 : offerDiscount,
              },
            ]
          : []),
        ...(selectedVoucher
          ? [
              {
                name: selectedVoucher.name,
                type: selectedVoucher.type,
                discount_percentage: selectedVoucher.discount_percentage,
                discount_static: selectedVoucher.discount_static,
                discount_maximum: selectedVoucher.discount_maximum,
                total_discount: selectedVoucher === null ? 0 : voucherDiscount,
              },
            ]
          : []),
      ],
      input_fields: raw,
      merged_input: merged,
      product_price: product.price,
      fee: fee,
      discount: totalDiscount,
      total_price: totalPrice + fee,
      checkout_token: hashedToken,
    };

    const [paymentSnapshot] = await this.databaseService.db
      .insert(tb.paymentSnapshots)
      .values({
        name: paymentMethod.name,
        payment_method_id: paymentMethod.id,
        type: paymentMethod.type,
        provider_ref_id: '',
        fee_static: paymentMethod.fee_static,
        fee_percentage: paymentMethod.fee_percentage,
        fee_type: paymentMethod.fee_type,
        provider_code: paymentMethod.provider_code,
        provider_name: paymentMethod.provider_name,
        allow_access: paymentMethod.allow_access,
        email: user.email,
        expired_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours
        phone_number: data.payment_phone_number,
      })
      .returning({
        id: tb.paymentSnapshots.id,
      });

    const [productSnapshot] = await this.databaseService.db
      .insert(tb.productSnapshots)
      .values({
        product_id: product.id,
        name: product.name,
        category_name: product.product_category.name,
        sub_category_name: product.product_sub_category.name,
        price: product.price,
        fullfillment_type: product.fullfillment_type,
        is_special_feature: product.product_category.is_special_feature,
        provider_code: product.provider_code,
        provider_price: product.provider_price,
        provider_max_price: product.provider_max_price,
        provider_input_separator: product.provider_input_separator,
        provider_ref_id: '',
        special_feature_key: product.product_category.special_feature_key,
        billing_type: product.billing_type,
        profit_percentage: product.profit_percentage,
        profit_static: product.profit_static,
        provider_name: product.provider_name,
        sku_code: product.sku_code,
      })
      .returning({
        id: tb.productSnapshots.id,
      });

    // expired in 5 minutes
    const inquiryExpired = new Date().getTime() + 5 * 60 * 1000;

    const [inquiry] = await this.databaseService.db
      .insert(tb.inquiries)
      .values({
        status: InquiryStatus.AWAIT_CONFIRMATION,

        cost_price: product.provider_price,
        discount_price: buildResponse.discount,
        fee: buildResponse.fee,
        price: buildResponse.product_price,
        total_price: buildResponse.total_price,
        admin_fee: 0,
        profit:
          buildResponse.total_price -
          product.provider_price -
          buildResponse.fee,

        product_snapshot_id: productSnapshot.id,
        payment_snapshot_id: paymentSnapshot.id,

        user_id: user.id,

        expired_at: new Date(inquiryExpired),
      })
      .returning({
        id: tb.inquiries.id,
      });

    return SendResponse.success({
      inquiry_id: inquiry.id,
      ...buildResponse,
    });
  }

  private generateOrderId(userId?: string): string {
    const prefix = 'T';
    const userPart = userId ? userId.slice(0, 4).toUpperCase() : 'guest';
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();

    return `${prefix}${userPart}${timestamp}${randomPart}`;
  }

  private calculateFee(
    amountReceived: number,
    feePercent: number,
    feeFixed: number,
  ): number {
    const total =
      amountReceived / (1 - feePercent) + feeFixed / (1 - feePercent);
    const fee = total - amountReceived;
    return Math.ceil(fee);
  }

  private getMergedInputFields(
    inputFields: {
      name: string;
      is_required: boolean;
      type: any;
      options?: any[];
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
          : undefined;
        if (!found) {
          throw new BadRequestException(
            `Input field ${input.name} is required.`,
          );
        }
      }
    });

    // Build merged string
    const inputValues = inputFields.map((input) => {
      const found = Array.isArray(dataInputFields)
        ? dataInputFields.find((f) => f.name === input.name)
        : undefined;
      return found?.value ?? '';
    });
    return {
      raw: Array.isArray(dataInputFields) ? dataInputFields : [],
      merged: inputValues.join(separator),
    };
  }
}
