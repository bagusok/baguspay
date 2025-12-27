/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  InquiryStatus,
  OfferType,
  OrderStatus,
  PaymentMethodAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
  PaymentStatus,
  tb,
} from '@repo/db/types';

import {
  and,
  arrayContains,
  asc,
  eq,
  gte,
  inArray,
  lte,
  ne,
  or,
  sql,
} from '@repo/db';
import * as crypto from 'crypto';
import { TUser } from 'src/common/types/meta.type';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service';
import { OffersService } from 'src/offers/offers.service';
import { PaymentsService } from 'src/payments/payments.service';
import { QueueService } from 'src/queue/queue.service';
import { StorageService } from 'src/storage/storage.service';
import { InquiryUniversalDto } from './dtos/inquiry.universal.dto';
import { CheckoutDto } from './dtos/order.dto';

@Injectable()
export class OrderV2Service {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly pgService: PaymentGatewayService,
    private readonly queueService: QueueService,
    private readonly offerService: OffersService,
    private readonly paymentService: PaymentsService,
    private readonly storageService: StorageService,
  ) {}

  async getPriceBy(
    productId: string,
    user: TUser,
    voucherId: string | null = null,
  ) {
    const [product] = await this.databaseService.db
      .select({
        id: tb.products.id,
        name: tb.products.name,
        price: tb.products.price,
        product_category: {
          id: tb.productCategories.id,
          name: tb.productCategories.name,
          is_special_feature: tb.productCategories.is_special_feature,
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
          eq(tb.products.id, productId),
          eq(tb.products.is_available, true),
          eq(tb.productCategories.is_available, true),
          eq(tb.productSubCategories.is_available, true),
          eq(tb.productCategories.is_special_feature, false),
        ),
      )
      .limit(1);

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found OR not available.`,
      );
    }

    const offers = await this.offerService.getApplicableOffers(
      product.id,
      user,
      product.price,
    );

    const selectedOffer =
      offers.find((o) => o.type === OfferType.FLASH_SALE) || offers[0] || null;

    let selectedVoucher: any = null;
    if (voucherId) {
      selectedVoucher = await this.offerService.getVoucher(
        voucherId,
        product.id,
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

    let voucherPaymentMethod: string[] = [];
    if (selectedVoucher && !selectedVoucher.is_all_payment_methods) {
      const allowedMethods = await this.databaseService.db
        .select({ id: tb.offerPaymentMethods.payment_method_id })
        .from(tb.offerPaymentMethods)
        .where(eq(tb.offerPaymentMethods.offer_id, selectedVoucher.id));

      voucherPaymentMethod = allowedMethods.map((m) => m.id);
    }

    const paymentCategories =
      await this.databaseService.db.query.paymentMethodCategories.findMany({
        columns: {
          id: true,
          name: true,
        },
        with: {
          payment_methods: {
            where: and(
              eq(tb.paymentMethods.is_available, true),
              arrayContains(tb.paymentMethods.allow_access, [
                PaymentMethodAllowAccess.ORDER,
              ]),
              lte(tb.paymentMethods.min_amount, totalPrice),
              gte(tb.paymentMethods.max_amount, totalPrice),
              ...(voucherPaymentMethod.length > 0
                ? [inArray(tb.paymentMethods.id, voucherPaymentMethod)]
                : []),
              ...(!user
                ? [
                    or(
                      ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
                      ne(
                        tb.paymentMethods.provider_name,
                        PaymentMethodProvider.BALANCE,
                      ),
                    ),
                  ]
                : []),
            ),
            columns: {
              id: true,
              name: true,
              type: true,
              fee_percentage: true,
              fee_static: true,
              min_amount: true,
              max_amount: true,
              label: true,
              image_url: true,
              is_featured: true,
              is_need_email: true,
              is_need_phone_number: true,
              cut_off_start: true,
              cut_off_end: true,
              is_available: true,
            },
          },
        },
      });

    const payment_methods = paymentCategories.map((category) => {
      const { payment_methods: methods, ...rest } = category;
      return {
        ...rest,
        items: methods.map((method) => {
          let isAvailable = method.is_available;

          if (selectedVoucher && voucherPaymentMethod.length > 0) {
            if (!voucherPaymentMethod.includes(method.id)) {
              isAvailable = false;
            }
          }

          if (
            totalPrice < method.min_amount ||
            totalPrice > method.max_amount
          ) {
            isAvailable = false;
          }

          const paymentFee = this.calculateFee(
            totalPrice,
            method.fee_percentage / 100,
            method.fee_static,
          );

          return {
            ...method,
            is_available: isAvailable,
            payment_fee: paymentFee,
            product_price: product.price,
            discount: totalDiscount,
            total: totalPrice + paymentFee,
            image_url: this.storageService.getFileUrl(method.image_url),
          };
        }),
      };
    });

    return SendResponse.success({
      payment_methods,
      offers: selectedOffer
        ? {
            name: selectedOffer.name,
            type: selectedOffer.type,
            discount_percentage: selectedOffer.discount_percentage,
            discount_static: selectedOffer.discount_static,
            discount_maximum: selectedOffer.discount_maximum,
            total_discount: offerDiscount,
          }
        : null,
      voucher: selectedVoucher
        ? {
            name: selectedVoucher.name,
            type: selectedVoucher.type,
            discount_percentage: selectedVoucher.discount_percentage,
            discount_static: selectedVoucher.discount_static,
            discount_maximum: selectedVoucher.discount_maximum,
            total_discount: voucherDiscount,
          }
        : null,
    });
  }

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

        expired_in: paymentMethod.expired_in,
        expired_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours

        is_need_email: paymentMethod.is_need_email,
        is_need_phone_number: paymentMethod.is_need_phone_number,
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
        status: InquiryStatus.CONFIRMED,

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
        customer_email: user.email,

        customer_input: raw,
        customer_input_merged: merged,
        customer_name: '',
        customer_phone: data.phone_number,
        inquiry_provider: product.provider_name,
        offer_applied: [
          ...(selectedOffer
            ? [
                {
                  id: selectedOffer.id,
                  type: selectedOffer.type,
                },
              ]
            : []),
          ...(selectedVoucher
            ? [
                {
                  id: selectedVoucher.id,
                  type: OfferType.VOUCHER,
                },
              ]
            : []),
        ],
        expired_at: new Date(inquiryExpired),
      })
      .returning({
        id: tb.inquiries.id,
      });

    const checkoutTokenData = {
      inquiry_id: inquiry.id,
      product_id: product.id,
      payment_method_id: paymentMethod.id,
      input_fields: raw,
      product_price: product.price,
      fee: fee,
      discount: totalDiscount,
      total_price: totalPrice + fee,
      offers: [
        ...(selectedOffer
          ? [
              {
                id: selectedOffer.id,
                type: selectedOffer.type,
              },
            ]
          : []),
        ...(selectedVoucher
          ? [
              {
                id: selectedVoucher.id,
                type: OfferType.VOUCHER,
              },
            ]
          : []),
      ],
    };
    const rawToken = `PREPAID:${JSON.stringify(checkoutTokenData)}:${timestamp}:${user.id}`;
    const hashedToken = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('CHECKOUT_TOKEN_SECRET'),
      )
      .update(rawToken)
      .digest('base64url');

    return SendResponse.success({
      inquiry_id: inquiry.id,
      ...buildResponse,
      checkout_token: hashedToken,
    });
  }

  async checkout(
    data: CheckoutDto,
    timestamp: number,
    user: TUser,
    ip: string | null = null,
    userAgent: string | null = null,
  ) {
    const inquiryData = await this.databaseService.db.query.inquiries.findFirst(
      {
        where: and(
          eq(tb.inquiries.id, data.inquiry_id),
          eq(tb.inquiries.user_id, user.id),
          eq(tb.inquiries.status, InquiryStatus.CONFIRMED),
        ),
        with: {
          payment_snapshot: true,
          product_snapshot: true,
        },
      },
    );

    if (!inquiryData) {
      throw new NotFoundException(
        `Inquiry with ID ${data.inquiry_id} not found or not valid for checkout.`,
      );
    }

    const checkoutTokenData = {
      inquiry_id: inquiryData.id,
      product_id: inquiryData.product_snapshot.product_id,
      payment_method_id: inquiryData.payment_snapshot.payment_method_id,
      input_fields: inquiryData.customer_input,
      product_price: inquiryData.price,
      fee: inquiryData.fee,
      discount: inquiryData.discount_price,
      total_price: inquiryData.total_price,
      offers: inquiryData.offer_applied,
    };
    const rawToken = `PREPAID:${JSON.stringify(checkoutTokenData)}:${timestamp}:${user.id}`;
    const hashedToken = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('CHECKOUT_TOKEN_SECRET'),
      )
      .update(rawToken)
      .digest('base64url');
    if (hashedToken !== data.checkout_token) {
      throw new BadRequestException('Invalid checkout token.');
    }

    // --- Order ID ---
    const orderId = this.generateOrderId(user?.id);

    const { createPayment } = await this.databaseService.db.transaction(
      async (tx) => {
        const createPayment = await this.pgService.createPayment({
          user_id: user.id,
          amount: inquiryData.price,
          customer_email: user.email,
          customer_phone: inquiryData.customer_phone,
          customer_name: user.name,
          expired_in: inquiryData.payment_snapshot.expired_in,
          provider_code: inquiryData.payment_snapshot.provider_code,
          fee_in_percent: inquiryData.payment_snapshot.fee_percentage,
          fee_static: inquiryData.payment_snapshot.fee_static,
          fee_type: inquiryData.payment_snapshot.fee_type,
          provider_name: inquiryData.payment_snapshot.provider_name,
          id: orderId,
          order_items: [
            {
              name: `${inquiryData.product_snapshot.category_name} - ${inquiryData.product_snapshot.name}`,
              price: inquiryData.total_price,
              quantity: 1,
              product_id: inquiryData.product_snapshot.product_id,
              customer_input: inquiryData.customer_input_merged,
            },
          ],
        });

        const [updatePaymentSnapshot] = await tx
          .update(tb.paymentSnapshots)
          .set({
            provider_ref_id: createPayment.ref_id,
            qr_code: createPayment.qr_code,
            pay_code: createPayment.pay_code,
            pay_url: createPayment.pay_url,
            expired_at: createPayment.expired_at,
          })
          .where(eq(tb.paymentSnapshots.id, inquiryData.payment_snapshot_id))
          .returning({
            id: tb.paymentSnapshots.id,
          });

        await tx
          .insert(tb.orders)
          .values({
            inquiry_id: inquiryData.id,
            payment_snapshot_id: updatePaymentSnapshot.id,
            product_snapshot_id: inquiryData.product_snapshot_id,
            user_id: user.id,
            price: inquiryData.price,
            total_price: createPayment.amount,
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
          })
          .returning({
            id: tb.orders.id,
          });

        if (createPayment.status == PaymentStatus.SUCCESS) {
          await this.queueService.addOrderJob(orderId);
        }

        if (createPayment.status == PaymentStatus.PENDING) {
          const delay =
            new Date(createPayment.expired_at).getTime() - Date.now();
          await this.queueService.addExpiredOrderJob(orderId, delay);
        }

        await tx
          .update(tb.products)
          .set({
            stock: sql`${tb.products.stock} - 1`,
          })
          .where(eq(tb.products.id, inquiryData.product_snapshot.product_id));

        await tx
          .update(tb.inquiries)
          .set({
            status: InquiryStatus.USED,
          })
          .where(eq(tb.inquiries.id, inquiryData.id));
        return { createPayment };
      },
    );

    return SendResponse.success({
      order_id: orderId,
      product_name: `${inquiryData.product_snapshot.category_name} - ${inquiryData.product_snapshot.name}`,
      payment_method: `${inquiryData.payment_snapshot.type} - ${inquiryData.payment_snapshot.name}`,
      amount: createPayment.amount,
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
