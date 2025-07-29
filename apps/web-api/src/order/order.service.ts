/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  ne,
  or,
  sql,
} from '@repo/db';
import {
  OfferType,
  OrderStatus,
  PaymentMethodAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
  PaymentStatus,
  ProductBillingType,
  tb,
  UserRole,
} from '@repo/db/types';

import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { TUser } from 'src/common/types/global';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service';
import { QueueService } from 'src/queue/queue.service';
import {
  CheckoutPrepaidDto,
  GetOrderHistoryQueryDto,
  OrderIdDto,
  PreCheckoutPrepaidDto,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly pgService: PaymentGatewayService,
    private readonly queueService: QueueService,
  ) {}

  async getPriceBy(
    productId: string,
    isFlashSale = false,
    voucherId: string | null = null,
    user?: TUser,
  ) {
    const product = await this.databaseService.db.query.products.findFirst({
      where: and(
        eq(tb.products.id, productId),
        eq(tb.products.is_available, true),
        eq(tb.products.billing_type, ProductBillingType.PREPAID),
        gte(tb.products.stock, 1),
      ),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const where = [];

    if (isFlashSale) {
      if (!user)
        throw new BadRequestException(
          'Please login to access flash sale offers.',
        );

      if (voucherId)
        throw new BadRequestException(
          'Voucher is not supported for flash sale offers.',
        );

      where.push(eq(tb.offers.type, OfferType.FLASH_SALE));
    } else {
      where.push(
        or(
          eq(tb.offers.type, OfferType.VOUCHER),
          eq(tb.offers.type, OfferType.DISCOUNT),
        ),
      );
    }

    // Ambil semua offer relevan
    const offers = await this.databaseService.db
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
          or(
            eq(tb.offer_products.product_id, productId),
            eq(tb.offers.is_all_products, true),
          ),
          eq(tb.offers.is_available, true),
          eq(tb.offers.is_deleted, false),
          gte(tb.offers.quota, 0),
          lte(tb.offers.min_amount, product.price),
          lte(tb.offers.start_date, new Date()),
          gte(tb.offers.end_date, new Date()),
          ...where,
        ),
      );

    let selectedOffer: (typeof offers)[number] | null = null;
    let selectedVoucher: (typeof offers)[number] | null = null;
    const voucherPaymentMethod = [];

    let totalDiscount = 0;

    if (isFlashSale) {
      if (!user) {
        throw new BadRequestException(
          'Please login to access flash sale offers.',
        );
      }

      // Ambil offer flash sale pertama (jika ada)
      selectedOffer =
        offers.find((o) => o.type === OfferType.FLASH_SALE) || null;
      if (!selectedOffer) {
        throw new NotFoundException(
          `No flash sale offer available for product`,
        );
      }
      totalDiscount = Math.round(
        (product.price * (selectedOffer.discount_percentage ?? 0)) / 100 +
          (selectedOffer.discount_static ?? 0),
      );
      if (
        selectedOffer.discount_maximum &&
        totalDiscount > selectedOffer.discount_maximum
      ) {
        totalDiscount = selectedOffer.discount_maximum;
      }
    } else {
      // Ambil offer discount terbesar
      const discountOffers = offers.filter(
        (o) => o.type === OfferType.DISCOUNT,
      );

      if (discountOffers.length > 0) {
        // Hitung diskon untuk setiap offer
        const discounts = discountOffers.map((o) => {
          let d = Math.round(
            (product.price * (o.discount_percentage ?? 0)) / 100 +
              (o.discount_static ?? 0),
          );
          if (o.discount_maximum && d > o.discount_maximum) {
            d = o.discount_maximum;
          }
          return { offer: o, discount: d };
        });
        // Pilih offer dengan diskon terbesar
        const best = discounts.reduce((a, b) =>
          b.discount > a.discount ? b : a,
        );
        selectedOffer = best.offer;
        totalDiscount = best.discount;
      }
    }

    if (voucherId) {
      if (!user) {
        throw new BadRequestException(
          'Please login to use voucher with this offer.',
        );
      }

      if (selectedOffer) {
        if (selectedOffer.type !== OfferType.DISCOUNT) {
          throw new BadRequestException(
            'This offer is not combinable with voucher. Please remove the voucher.',
          );
        }

        if (!selectedOffer.is_combinable_with_voucher) {
          throw new BadRequestException(
            'This offer is not combinable with voucher. Please remove the voucher.',
          );
        }
      }

      const voucher = offers.find(
        (o) => o.type === OfferType.VOUCHER && o.id === voucherId,
      );

      if (!voucher) {
        throw new NotFoundException(
          `Voucher with ID ${voucherId} not found OR not available for this product.`,
        );
      }

      // check quota voucher
      if (voucher.usage_count >= voucher.quota) {
        throw new NotAcceptableException(
          `Voucher with ID ${voucher.id} is fully booked.`,
        );
      }

      // Check Quota per User
      const [countUserQuota] = await this.databaseService.db
        .select({
          exist: sql`1`,
        })
        .from(tb.offerOnOrders)
        .where(
          and(
            eq(tb.offerOnOrders.offer_id, voucher.id),
            eq(
              tb.offerOnOrders.user_id,
              user?.id || '00000000-0000-0000-0000-000000000000',
            ),
          ),
        )
        .limit(1);

      if (countUserQuota?.exist) {
        throw new NotAcceptableException(`You have already used this voucher.`);
      }

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
          throw new NotFoundException(
            `Voucher with ID ${voucherId} not found OR not available for this user.`,
          );
        }
      }

      if (!voucher.is_all_payment_methods) {
        const _voucherPaymentMethod = await this.databaseService.db
          .select({
            pay_id: tb.offerPaymentMethods.payment_method_id,
          })
          .from(tb.offerPaymentMethods)
          .where(eq(tb.offerPaymentMethods.offer_id, voucher.id));

        voucherPaymentMethod.push(
          ..._voucherPaymentMethod.map((m) => m.pay_id),
        );
      }

      // calculate voucher discount
      const voucherDiscount = Math.round(
        (product.price * (voucher.discount_percentage ?? 0)) / 100 +
          (voucher.discount_static ?? 0),
      );

      if (voucherDiscount > voucher.discount_maximum) {
        totalDiscount += voucher.discount_maximum;
      } else {
        totalDiscount += voucherDiscount;
      }

      selectedVoucher = voucher;
    }

    // Hitung harga akhir
    const finalPrice = product.price - totalDiscount;

    const paymentMethods =
      await this.databaseService.db.query.paymentMethodCategories.findMany({
        columns: { name: true },
        with: {
          payment_methods: {
            where: and(
              eq(tb.paymentMethods.is_available, true),
              arrayContains(tb.paymentMethods.allow_access, [
                PaymentMethodAllowAccess.ORDER,
              ]),
              lte(tb.paymentMethods.min_amount, finalPrice),
              gte(tb.paymentMethods.max_amount, finalPrice),
            ),
            columns: {
              id: true,
              name: true,
              fee_percentage: true,
              fee_static: true,
              is_available: true,
              cut_off_start: true,
              cut_off_end: true,
              image_url: true,
              label: true,
              is_featured: true,
              min_amount: true,
              max_amount: true,
              is_need_email: true,
              is_need_phone_number: true,
            },
          },
        },
      });

    const newPayments = paymentMethods.map((category) => ({
      ...category,
      payment_methods: category.payment_methods.map((m) => {
        let isAvailable = m.is_available;

        if (selectedVoucher) {
          if (!voucherPaymentMethod.includes(m.id)) {
            isAvailable = false;
          }
        }

        if (finalPrice < m.min_amount || finalPrice > m.max_amount) {
          isAvailable = false;
        }

        const fee = this.calculateFee(
          finalPrice,
          m.fee_percentage / 100,
          m.fee_static,
        );
        return {
          ...m,
          is_available: isAvailable,
          payment_fee: fee,
          product_price: product.price,
          discount: totalDiscount,
          total: finalPrice + fee,
        };
      }),
    }));

    return SendResponse.success({
      payment_methods: newPayments,
      offers: selectedOffer
        ? {
            name: selectedOffer.name,
          }
        : null,
      voucher: selectedVoucher
        ? {
            name: selectedVoucher.name,
          }
        : null,
    });
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

  async preCheckoutPrepaid(
    data: PreCheckoutPrepaidDto,
    timestamp: number,
    isFlashSale = false,
    user?: TUser,
  ) {
    const [product] = await this.databaseService.db
      .select({
        id: tb.products.id,
        provider_input_separator: tb.products.provider_input_separator,
        name: tb.products.name,
        price: tb.products.price,
        product_category: {
          id: tb.productCategories.id,
          name: tb.productCategories.name,
        },
        product_sub_category: {
          id: tb.productSubCategories.id,
          name: tb.productSubCategories.name,
        },
      })
      .from(tb.products)
      .innerJoin(
        tb.productSubCategories,
        and(
          eq(tb.productSubCategories.id, tb.products.product_sub_category_id),
          eq(tb.productSubCategories.is_available, true),
        ),
      )
      .innerJoin(
        tb.productCategories,
        and(
          eq(
            tb.productCategories.id,
            tb.productSubCategories.product_category_id,
          ),
          eq(tb.productCategories.is_available, true),
        ),
      )
      .where(
        and(
          eq(tb.products.id, data.product_id),
          eq(tb.products.is_available, true),
          eq(tb.products.billing_type, ProductBillingType.PREPAID),
        ),
      )
      .limit(1)
      .orderBy(desc(tb.products.created_at));

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
    const offers = await this.databaseService.db
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
          eq(tb.offer_products.product_id, data.product_id),
          eq(tb.offer_products.offer_id, tb.offers.id),
        ),
      )
      .where(
        and(
          or(
            eq(tb.offer_products.product_id, data.product_id),
            eq(tb.offers.is_all_products, true),
          ),
          eq(tb.offers.is_available, true),
          eq(tb.offers.is_deleted, false),
          gte(tb.offers.quota, 0),
          lte(tb.offers.min_amount, product.price),
          lte(tb.offers.start_date, new Date()),
          gte(tb.offers.end_date, new Date()),
          or(
            eq(tb.offers.type, OfferType.VOUCHER),
            eq(tb.offers.type, OfferType.DISCOUNT),
          ),
        ),
      );

    let selectedOffer: (typeof offers)[number] | null = null;
    let selectedVoucher: (typeof offers)[number] | null = null;
    const voucherPaymentMethod = [];

    let totalDiscountOffer = 0;
    let totalDiscountVoucher = 0;

    if (isFlashSale) {
      // Ambil offer flash sale pertama (jika ada)
      selectedOffer =
        offers.find((o) => o.type === OfferType.FLASH_SALE) || null;
      if (!selectedOffer) {
        throw new NotFoundException(
          `No flash sale offer available for product`,
        );
      }

      // check quota flash sale
      if (selectedOffer.usage_count >= selectedOffer.quota)
        throw new NotAcceptableException(
          `Flash sale offer with ID ${selectedOffer.id} is fully booked.`,
        );

      // Check Quota per User
      const [countUserQuota] = await this.databaseService.db
        .select({
          exist: sql`1`,
        })
        .from(tb.offerOnOrders)
        .where(
          and(
            eq(tb.offerOnOrders.offer_id, selectedOffer.id),
            eq(
              tb.offerOnOrders.user_id,
              user?.id || '00000000-0000-0000-0000-000000000000',
            ),
          ),
        )
        .limit(1);

      if (countUserQuota?.exist) {
        throw new NotAcceptableException(
          `You have already booked this flash sale offer.`,
        );
      }

      totalDiscountOffer = Math.round(
        (product.price * (selectedOffer.discount_percentage ?? 0)) / 100 +
          (selectedOffer.discount_static ?? 0),
      );

      if (
        selectedOffer.discount_maximum &&
        totalDiscountOffer > selectedOffer.discount_maximum
      ) {
        totalDiscountOffer = selectedOffer.discount_maximum;
      }
    } else {
      // Ambil offer discount terbesar
      const discountOffers = offers.filter(
        (o) => o.type === OfferType.DISCOUNT,
      );

      if (discountOffers.length > 0) {
        // Hitung diskon untuk setiap offer
        const discounts = discountOffers.map((o) => {
          let d = Math.round(
            (product.price * (o.discount_percentage ?? 0)) / 100 +
              (o.discount_static ?? 0),
          );
          if (o.discount_maximum && d > o.discount_maximum) {
            d = o.discount_maximum;
          }
          return { offer: o, discount: d };
        });
        // Pilih offer dengan diskon terbesar
        const best = discounts.reduce((a, b) =>
          b.discount > a.discount ? b : a,
        );
        selectedOffer = best.offer;
        totalDiscountOffer = best.discount;
      }
    }

    if (data.voucher_id) {
      if (!user) {
        throw new BadRequestException(
          'Please login to use voucher with this offer.',
        );
      }

      if (selectedOffer) {
        if (selectedOffer.type !== OfferType.DISCOUNT) {
          throw new BadRequestException(
            'This offer is not combinable with voucher. Please remove the voucher.',
          );
        }

        if (!selectedOffer.is_combinable_with_voucher) {
          throw new BadRequestException(
            'This offer is not combinable with voucher. Please remove the voucher.',
          );
        }
      }

      const voucher = offers.find(
        (o) => o.type === OfferType.VOUCHER && o.id === data.voucher_id,
      );

      if (!voucher) {
        throw new NotFoundException(
          `Voucher with ID ${data.voucher_id} not found OR not available for this product.`,
        );
      }

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
          throw new NotFoundException(
            `Voucher with ID ${data.voucher_id} not found OR not available for this user.`,
          );
        }
      }

      if (!voucher.is_all_payment_methods) {
        const _voucherPaymentMethod = await this.databaseService.db
          .select({
            pay_id: tb.offerPaymentMethods.payment_method_id,
          })
          .from(tb.offerPaymentMethods)
          .where(eq(tb.offerPaymentMethods.offer_id, voucher.id));

        voucherPaymentMethod.push(
          ..._voucherPaymentMethod.map((m) => m.pay_id),
        );
      }

      // check quota voucher
      if (voucher.usage_count >= voucher.quota) {
        throw new NotAcceptableException(
          `Voucher with ID ${voucher.id} is fully booked.`,
        );
      }

      // Check Quota per User
      const [countUserQuota] = await this.databaseService.db
        .select({
          exist: sql`1`,
        })
        .from(tb.offerOnOrders)
        .where(
          and(
            eq(tb.offerOnOrders.offer_id, voucher.id),
            eq(
              tb.offerOnOrders.user_id,
              user?.id || '00000000-0000-0000-0000-000000000000',
            ),
          ),
        )
        .limit(1);

      if (countUserQuota?.exist) {
        throw new NotAcceptableException(`You have already used this voucher.`);
      }

      // Diskon voucher
      const voucherDiscount = Math.round(
        (product.price * (voucher.discount_percentage ?? 0)) / 100 +
          (voucher.discount_static ?? 0),
      );

      if (voucherDiscount > voucher.discount_maximum) {
        totalDiscountVoucher += voucher.discount_maximum;
      } else {
        totalDiscountVoucher += voucherDiscount;
      }

      selectedVoucher = voucher;
      totalDiscountVoucher = voucherDiscount;
    }

    const totalDiscount = 0;
    const totalPrice = product.price - totalDiscount;
    if (totalPrice < 100) {
      throw new NotAcceptableException(
        'Total price after discount cannot be less than 1000.',
      );
    }

    // Payment method validation (voucher payment method support)
    const paymentMethod =
      await this.databaseService.db.query.paymentMethods.findFirst({
        where: and(
          eq(tb.paymentMethods.id, data.payment_method_id),
          eq(tb.paymentMethods.is_available, true),
          arrayContains(tb.paymentMethods.allow_access, [
            PaymentMethodAllowAccess.ORDER,
          ]),
          lte(tb.paymentMethods.min_amount, totalPrice),
          gte(tb.paymentMethods.max_amount, totalPrice),
          ...(selectedVoucher && voucherPaymentMethod.length > 0
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
      });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method with ID ${data.payment_method_id} not found OR not available.`,
      );
    }
    if (
      paymentMethod.type === PaymentMethodType.BALANCE ||
      paymentMethod.provider_name === PaymentMethodProvider.BALANCE
    ) {
      if (!user) {
        throw new NotAcceptableException(
          'Payment method balance is only available for registered users.',
        );
      }
      if (user.balance < totalPrice) {
        throw new HttpException(
          {
            statusCode: 402,
            message: 'Insufficient balance.',
          },
          402,
        );
      }
    }

    if (paymentMethod.is_need_phone_number && !data.payment_phone_number) {
      throw new BadRequestException(
        'Payment phone number is required for this payment method.',
      );
    }

    const fee = this.calculateFee(
      totalPrice,
      paymentMethod.fee_percentage / 100,
      paymentMethod.fee_static,
    );

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
                total_discount: totalDiscountOffer,
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
                total_discount: totalDiscountVoucher,
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

    return SendResponse.success(buildResponse);
  }

  async checkoutPrepaid(
    data: CheckoutPrepaidDto,
    timestamp: number,
    isFlashSale = false,
    user?: TUser,
    ip: string | null = null,
    userAgent: string | null = null,
  ) {
    const {
      selectedOffer,
      selectedVoucher,
      totalDiscountOffer,
      totalDiscountVoucher,
      totalPrice,
      paymentMethod,
      product,
      raw,
      merged,
      fee,
      orderId,
      totalDiscount,
    } = await this.databaseService.db.transaction(async (tx) => {
      // --- Product ---
      const [product] = await tx
        .select({
          products: tb.products,
          product_category: {
            id: tb.productCategories.id,
            name: tb.productCategories.name,
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
            eq(tb.products.billing_type, ProductBillingType.PREPAID),
            gte(tb.products.stock, 1),
          ),
        )
        .for('update')
        .limit(1)
        .orderBy(desc(tb.products.created_at));

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${data.product_id} not found OR not available.`,
        );
      }

      // --- Input Fields ---
      const inputFields = await tx.query.inputOnProductCategory.findMany({
        columns: { id: true },
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
        product.products.provider_input_separator,
      );

      // --- Offer & Voucher Logic ---
      const offers = await tx
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
            eq(tb.offer_products.product_id, data.product_id),
            eq(tb.offer_products.offer_id, tb.offers.id),
          ),
        )
        .where(
          and(
            or(
              eq(tb.offer_products.product_id, data.product_id),
              eq(tb.offers.is_all_products, true),
            ),
            eq(tb.offers.is_available, true),
            eq(tb.offers.is_deleted, false),
            gte(tb.offers.quota, 0),
            lte(tb.offers.min_amount, product.products.price),
            lte(tb.offers.start_date, new Date()),
            gte(tb.offers.end_date, new Date()),
            or(
              eq(tb.offers.type, OfferType.VOUCHER),
              eq(tb.offers.type, OfferType.DISCOUNT),
              eq(tb.offers.type, OfferType.FLASH_SALE),
            ),
          ),
        );

      let selectedOffer = null;
      let selectedVoucher = null;
      const voucherPaymentMethod = [];
      let totalDiscountOffer = 0;
      let totalDiscountVoucher = 0;

      if (isFlashSale) {
        if (!user || user.role == UserRole.GUEST) {
          throw new BadRequestException(
            'Please login to access flash sale offers.',
          );
        }

        selectedOffer =
          offers.find((o) => o.type === OfferType.FLASH_SALE) || null;
        if (!selectedOffer) {
          throw new NotFoundException(
            `No flash sale offer available for product`,
          );
        }

        // Quota flash sale
        if (selectedOffer.usage_count >= selectedOffer.quota)
          throw new NotAcceptableException(
            `Flash sale offer with ID ${selectedOffer.id} is fully booked.`,
          );

        // Quota per user
        const [countUserQuota] = await tx
          .select({ exist: sql`1` })
          .from(tb.offerOnOrders)
          .where(
            and(
              eq(tb.offerOnOrders.offer_id, selectedOffer.id),
              eq(
                tb.offerOnOrders.user_id,
                user?.id || '00000000-0000-0000-0000-000000000000',
              ),
            ),
          )
          .limit(1);

        if (countUserQuota?.exist) {
          throw new NotAcceptableException(
            `You have already booked this flash sale offer.`,
          );
        }

        totalDiscountOffer = Math.round(
          (product.products.price * (selectedOffer.discount_percentage ?? 0)) /
            100 +
            (selectedOffer.discount_static ?? 0),
        );

        if (
          selectedOffer.discount_maximum &&
          totalDiscountOffer > selectedOffer.discount_maximum
        ) {
          totalDiscountOffer = selectedOffer.discount_maximum;
        }
      } else {
        // Discount terbesar
        const discountOffers = offers.filter(
          (o) => o.type === OfferType.DISCOUNT,
        );

        if (discountOffers.length > 0) {
          const discounts = discountOffers.map((o) => {
            let d = Math.round(
              (product.products.price * (o.discount_percentage ?? 0)) / 100 +
                (o.discount_static ?? 0),
            );
            if (o.discount_maximum && d > o.discount_maximum) {
              d = o.discount_maximum;
            }
            return { offer: o, discount: d };
          });

          const best = discounts.reduce((a, b) =>
            b.discount > a.discount ? b : a,
          );

          selectedOffer = best.offer;
          totalDiscountOffer = best.discount;
        }
      }

      // Voucher
      if (data.voucher_id) {
        if (!user) {
          throw new BadRequestException(
            'Please login to use voucher with this offer.',
          );
        }

        if (selectedOffer) {
          if (selectedOffer.type !== OfferType.DISCOUNT) {
            throw new BadRequestException(
              'This offer is not combinable with voucher. Please remove the voucher.',
            );
          }

          if (!selectedOffer.is_combinable_with_voucher) {
            throw new BadRequestException(
              'This offer is not combinable with voucher. Please remove the voucher.',
            );
          }
        }

        const voucher = offers.find(
          (o) => o.type === OfferType.VOUCHER && o.id === data.voucher_id,
        );

        if (!voucher) {
          throw new NotFoundException(
            `Voucher with ID ${data.voucher_id} not found OR not available for this product.`,
          );
        }

        if (!voucher.is_all_users) {
          const [voucherUser] = await tx
            .select({ id: tb.offerUsers.id })
            .from(tb.offerUsers)
            .where(
              and(
                eq(tb.offerUsers.offer_id, voucher.id),
                eq(tb.offerUsers.user_id, user?.id),
              ),
            )
            .limit(1);

          if (!voucherUser) {
            throw new NotFoundException(
              `Voucher with ID ${data.voucher_id} not found OR not available for this user.`,
            );
          }
        }

        if (!voucher.is_all_payment_methods) {
          const _voucherPaymentMethod = await tx
            .select({ pay_id: tb.offerPaymentMethods.payment_method_id })
            .from(tb.offerPaymentMethods)
            .where(eq(tb.offerPaymentMethods.offer_id, voucher.id));
          voucherPaymentMethod.push(
            ..._voucherPaymentMethod.map((m) => m.pay_id),
          );
        }

        // Quota voucher
        if (voucher.usage_count >= voucher.quota) {
          throw new NotAcceptableException(
            `Voucher with ID ${voucher.id} is fully booked.`,
          );
        }

        // Quota per user
        const [countUserQuota] = await tx
          .select({ exist: sql`1` })
          .from(tb.offerOnOrders)
          .where(
            and(
              eq(tb.offerOnOrders.offer_id, voucher.id),
              eq(
                tb.offerOnOrders.user_id,
                user?.id || '00000000-0000-0000-0000-000000000000',
              ),
            ),
          )
          .limit(1);

        if (countUserQuota?.exist) {
          throw new NotAcceptableException(
            `You have already used this voucher.`,
          );
        }

        // Diskon voucher
        const voucherDiscount = Math.round(
          (product.products.price * (voucher.discount_percentage ?? 0)) / 100 +
            (voucher.discount_static ?? 0),
        );

        if (voucherDiscount > voucher.discount_maximum) {
          totalDiscountVoucher += voucher.discount_maximum;
        } else {
          totalDiscountVoucher += voucherDiscount;
        }

        selectedVoucher = voucher;
      }

      const totalDiscount = totalDiscountOffer + totalDiscountVoucher;

      // --- Total Price ---
      const totalPrice = product.products.price - totalDiscount;
      if (totalPrice < 1000) {
        throw new NotAcceptableException(
          'Total price after discount cannot be less than 1000.',
        );
      }

      // --- Payment Method ---
      const paymentMethod = await tx.query.paymentMethods.findFirst({
        where: and(
          eq(tb.paymentMethods.id, data.payment_method_id),
          eq(tb.paymentMethods.is_available, true),
          arrayContains(tb.paymentMethods.allow_access, [
            PaymentMethodAllowAccess.ORDER,
          ]),
          lte(tb.paymentMethods.min_amount, totalPrice),
          gte(tb.paymentMethods.max_amount, totalPrice),
          ...(selectedVoucher && voucherPaymentMethod.length > 0
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
      });

      if (!paymentMethod) {
        throw new NotFoundException(
          `Payment method with ID ${data.payment_method_id} not found OR not available.`,
        );
      }

      if (
        paymentMethod.type === PaymentMethodType.BALANCE ||
        paymentMethod.provider_name === PaymentMethodProvider.BALANCE
      ) {
        if (!user) {
          throw new NotAcceptableException(
            'Payment method balance is only available for registered users.',
          );
        }

        if (user.balance < totalPrice) {
          throw new HttpException(
            { statusCode: 402, message: 'Insufficient balance.' },
            402,
          );
        }
      }

      if (paymentMethod.is_need_phone_number && !data.payment_phone_number) {
        throw new BadRequestException(
          'Payment phone number is required for this payment method.',
        );
      }

      // --- Fee ---
      const fee = this.calculateFee(
        totalPrice,
        paymentMethod.fee_percentage / 100,
        paymentMethod.fee_static,
      );

      // --- Token ---
      const { checkout_token, ...rest } = data;
      const rawToken = `PREPAID:${JSON.stringify(rest)}:${timestamp}:${user.id}`;
      const hashedToken = crypto
        .createHmac(
          'sha256',
          this.configService.get<string>('CHECKOUT_TOKEN_SECRET'),
        )
        .update(rawToken)
        .digest('base64url');
      if (hashedToken !== checkout_token) {
        throw new BadRequestException('Invalid checkout token.');
      }

      // --- Order ID ---
      const orderId = this.generateOrderId(user?.id);

      // --- Payment ---
      const createPayment = await this.pgService.createPayment({
        user_id: user?.id ?? null,
        amount: totalPrice,
        customer_email: user?.email,
        customer_phone: data.payment_phone_number,
        customer_name: user?.name,
        expired_in: paymentMethod.expired_in,
        provider_code: paymentMethod.provider_code,
        fee: fee,
        fee_type: paymentMethod.fee_type,
        provider_name: paymentMethod.provider_name,
        id: orderId,
        order_items: [
          {
            name: `${product.product_category.name} - ${product.products.name}`,
            price: totalPrice + fee,
            quantity: 1,
            product_id: product.products.id,
            customer_input: merged,
          },
        ],
      });

      // --- Snapshots & Order ---
      const [createPaymentSnapshot] = await tx
        .insert(tb.paymentSnapshots)
        .values({
          name: paymentMethod.name,
          provider_code: paymentMethod.provider_code,
          provider_name: paymentMethod.provider_name,
          payment_method_id: paymentMethod.id,
          provider_ref_id: createPayment.data.ref_id,
          allow_access: paymentMethod.allow_access,
          email: user?.email,
          phone_number: data.payment_phone_number,
          qr_code: createPayment.data.qr_code,
          fee_percentage: paymentMethod.fee_percentage,
          fee_static: paymentMethod.fee_static,
          fee_type: paymentMethod.fee_type,
          pay_code: createPayment.data.pay_code,
          pay_url: createPayment.data.pay_url,
          expired_at: createPayment.data.expired_at,
        })
        .returning({ id: tb.paymentSnapshots.id });

      const [createProductSnapshot] = await tx
        .insert(tb.productSnapshots)
        .values({
          product_id: product.products.id,
          name: product.products.name,
          category_name: product.product_category.name,
          sub_category_name: product.product_sub_category.name,
          price: product.products.price,
          provider_code: product.products.provider_code,
          provider_max_price: paymentMethod.max_amount,
          provider_price: product.products.provider_price,
          provider_name: product.products.provider_name,
          provider_ref_id: '',
          sku_code: product.products.sku_code,
          billing_type: product.products.billing_type,
          fullfillment_type: product.products.fullfillment_type,
          profit_percentage: product.products.profit_percentage,
          profit_static: product.products.profit_static,
          provider_input_separator: product.products.provider_input_separator,
          notes: product.products.notes,
        })
        .returning({ id: tb.productSnapshots.id });

      // const profit = Math.round(
      //   product.products.price -
      //     product.products.provider_price -
      //     totalDiscount,
      // );
      const profit = Math.round(
        createPayment.data.amount_received +
          totalDiscount -
          product.products.provider_price -
          totalDiscount,
      );

      const [order] = await tx
        .insert(tb.orders)
        .values({
          payment_snapshot_id: createPaymentSnapshot.id,
          product_snapshot_id: createProductSnapshot.id,
          user_id: user?.id || '00000000-0000-0000-0000',
          price: product.products.price,
          total_price: createPayment.data.amount,
          discount_price: totalDiscount,
          cost_price: product.products.provider_price,
          fee: createPayment.data.total_fee,
          profit: profit,
          sn_number: '',
          order_id: orderId,
          payment_status: createPayment.data.status,
          order_status:
            createPayment.data.status == PaymentStatus.SUCCESS
              ? OrderStatus.PENDING
              : OrderStatus.NONE,
          customer_input: merged,
          customer_phone: data.phone_number,
          customer_ip: ip,
          customer_ua: userAgent,
        })
        .returning({
          id: tb.orders.id,
        });

      if (selectedOffer) {
        await tx.insert(tb.offerOnOrders).values({
          offer_id: selectedOffer.id,
          user_id: user?.id || '00000000-0000-0000-0000',
          discount_total: totalDiscountOffer,
          order_id: order.id,
        });

        await tx
          .update(tb.offers)
          .set({
            usage_count: sql`${tb.offers.usage_count}::int + 1`,
          })
          .where(eq(tb.offers.id, selectedOffer.id));
      }

      if (selectedVoucher) {
        await tx.insert(tb.offerOnOrders).values({
          offer_id: selectedVoucher.id,
          user_id: user?.id || '00000000-0000-0000-0000',
          discount_total: totalDiscountVoucher,
          order_id: order.id,
        });

        await tx
          .update(tb.offers)
          .set({
            usage_count: sql`${tb.offers.usage_count}::int + 1`,
          })
          .where(eq(tb.offers.id, selectedVoucher.id));
      }

      if (createPayment.data.status == PaymentStatus.SUCCESS) {
        await this.queueService.addOrderJob(orderId);
      }

      if (createPayment.data.status == PaymentStatus.PENDING) {
        const delay =
          new Date(createPayment.data.expired_at).getTime() - Date.now();
        await this.queueService.addExpiredOrderJob(orderId, delay);
      }

      await tx.update(tb.products).set({ stock: product.products.stock - 1 });

      return {
        selectedOffer,
        selectedVoucher,
        totalDiscountOffer,
        totalDiscountVoucher,
        totalDiscount,
        totalPrice,
        paymentMethod,
        product,
        raw,
        merged,
        fee,
        orderId,
        createPayment,
      };
    });

    const buildResponse = {
      product: {
        category: product.product_category.name,
        sub_category: product.product_sub_category.name,
        name: product.products.name,
        price: product.products.price,
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
                total_discount: totalDiscountOffer,
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
                total_discount: totalDiscountVoucher,
              },
            ]
          : []),
      ],
      input_fields: raw,
      merged_input: merged,
      product_price: product.products.price,
      fee: fee,
      discount: totalDiscount,
      total_price: totalPrice + fee,
      order_id: orderId,
    };

    return SendResponse.success(buildResponse);
  }

  async getHistory(query: GetOrderHistoryQueryDto, user: TUser) {
    const { page = 1, limit = 10 } = query;

    const whereConditions = [eq(tb.orders.user_id, user.id)];

    if (query.order_id) {
      whereConditions.push(eq(tb.orders.order_id, query.order_id));
    }

    if (query.order_status) {
      whereConditions.push(eq(tb.orders.order_status, query.order_status));
    }

    if (query.start_date) {
      whereConditions.push(
        gte(tb.orders.created_at, new Date(query.start_date)),
      );
    }

    if (query.end_date) {
      whereConditions.push(lte(tb.orders.created_at, new Date(query.end_date)));
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
    });

    const [total] = await this.databaseService.db
      .select({
        count: count(),
      })
      .from(tb.orders)
      .where(and(...whereConditions));

    return SendResponse.success(orders, 'Success', {
      meta: {
        total: total.count,
        total_pages: Math.ceil(total.count / limit),
        page: page,
        limit: limit,
      },
    });
  }

  async getById(data: OrderIdDto, user: TUser) {
    const order = await this.databaseService.db.query.orders.findFirst({
      where: and(
        eq(tb.orders.order_id, data.id),
        eq(tb.orders.user_id, user.id),
      ),
      with: {
        product_snapshot: true,
        payment_snapshot: true,
        offer_on_orders: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.id} not found.`);
    }

    return SendResponse.success(order);
  }

  private generateOrderId(userId?: string): string {
    const prefix = 'T';
    const userPart = userId ? userId.slice(0, 4).toUpperCase() : 'guest';
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();

    return `${prefix}${userPart}${timestamp}${randomPart}`;
  }
  /**
   * Validate and merge input fields for a product, using the product's separator.
   * Returns { raw: InputField[], merged: string }
   */
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
