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
  InferSelectModel,
  lte,
  ne,
  or,
} from '@repo/db';
import {
  OrderStatus,
  PaymentMethodAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
  PaymentStatus,
  ProductBillingType,
  tb,
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

  async getPriceBy(productId: string) {
    const product = await this.databaseService.db.query.products.findFirst({
      where: and(
        eq(tb.products.id, productId),
        eq(tb.products.is_available, true),
      ),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const paymentMethods =
      await this.databaseService.db.query.paymentMethodCategories.findMany({
        columns: {
          name: true,
        },
        with: {
          payment_methods: {
            where: and(
              eq(tb.paymentMethods.is_available, true),
              arrayContains(tb.paymentMethods.allow_access, [
                PaymentMethodAllowAccess.ORDER,
              ]),
              lte(tb.paymentMethods.min_amount, product.price),
              gte(tb.paymentMethods.max_amount, product.price),
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
        const fee = this.calculateFee(
          product.price,
          m.fee_percentage / 100,
          m.fee_static,
        );

        return {
          ...m,
          payment_fee: fee,
          product_price: product.price,
          total: product.price + fee,
        };
      }),
    }));
    return SendResponse.success(newPayments);
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
    user?: TUser,
  ) {
    const [product] = await this.databaseService.db
      .select()
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
          product.product_categories.id,
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

    const offer = await this.validateOffer(
      data.offer_id,
      product,
      user,
      data.payment_method_id,
      data.product_id,
    );

    let totalDiscount = Math.round(
      (product.products.price * (offer?.discount_percentage ?? 0)) / 100 +
        (offer?.discount_static ?? 0),
    );

    if (totalDiscount > offer?.discount_maximum) {
      totalDiscount = offer.discount_maximum;
    }

    const totalPrice = product.products.price - totalDiscount;

    if (totalPrice < 1000) {
      throw new NotAcceptableException(
        'Total price after discount cannot be less than 1000.',
      );
    }

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
        category: product.product_categories.name,
        sub_category: product.product_sub_categories.name,
        name: product.products.name,
        price: product.products.price,
      },
      payment_method: {
        id: paymentMethod.id,
        name: paymentMethod.name,
        type: paymentMethod.type,
      },
      offer: offer
        ? {
            offer_id: offer.id,
            name: offer.name,
            is_new_user: offer.is_new_user,
            discount_percentage: offer.discount_percentage,
            discount_static: offer.discount_static,
            discount_maximum: offer.discount_maximum,
            min_amount: offer.min_amount,
          }
        : null,
      input_fields: raw,
      merged_input: merged,
      product_price: product.products.price,
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
    user?: TUser,
  ) {
    const [product] = await this.databaseService.db
      .select()
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
          product.product_categories.id,
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

    const { fee, offer, totalPrice, totalDiscount, paymentMethod, orderId } =
      await this.databaseService.db.transaction(async (tx) => {
        const offer = await this.validateOffer(
          data.offer_id,
          product,
          user,
          data.payment_method_id,
          data.product_id,
          tx,
        );

        let totalDiscount = Math.round(
          (product.products.price * (offer?.discount_percentage ?? 0)) / 100 +
            (offer?.discount_static ?? 0),
        );

        if (totalDiscount > offer?.discount_maximum) {
          totalDiscount = offer.discount_maximum;
        }

        const totalPrice = product.products.price - totalDiscount;

        if (totalPrice < 1000) {
          throw new NotAcceptableException(
            'Total price after discount cannot be less than 1000.',
          );
        }

        const paymentMethod = await tx.query.paymentMethods.findFirst({
          where: and(
            eq(tb.paymentMethods.id, data.payment_method_id),
            eq(tb.paymentMethods.is_available, true),
            arrayContains(tb.paymentMethods.allow_access, [
              PaymentMethodAllowAccess.ORDER,
            ]),
            lte(tb.paymentMethods.min_amount, totalPrice),
            gte(tb.paymentMethods.max_amount, totalPrice),
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

        const orderId = this.generateOrderId(user?.id);

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
              name: `${product.product_categories.name} - ${product.products.name}`,
              price: totalPrice + fee,
              quantity: 1,
              product_id: product.products.id,
              customer_input: merged,
            },
          ],
        });

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
          .returning({
            id: tb.paymentSnapshots.id,
          });

        const [createProductSnapshot] = await tx
          .insert(tb.productSnapshots)
          .values({
            product_id: product.products.id,
            name: product.products.name,
            sub_name: product.products.sub_name,
            price: product.products.price,
            provider_code: product.products.provider_code,
            provider_max_price: paymentMethod.max_amount,
            provider_price: totalPrice + fee,
            provider_name: product.products.provider_name,
            provider_ref_id: '',
            sku_code: product.products.sku_code,
            billing_type: product.products.billing_type,
            total_price: product.products.price + createPayment.data.total_fee,
            fullfillment_type: product.products.fullfillment_type,
            profit_percentage: product.products.profit_percentage,
            profit_static: product.products.profit_static,
            provider_input_separator: product.products.provider_input_separator,
            notes: product.products.notes,
          })
          .returning({
            id: tb.productSnapshots.id,
          });

        const profit = Math.round(
          createPayment.data.amount -
            createPayment.data.total_fee -
            product.products.provider_price -
            totalDiscount,
        );

        let offerOnOrder: InferSelectModel<typeof tb.offerOnOrders> | null =
          null;

        if (offer) {
          const [createOfferOnOrder] = await tx
            .insert(tb.offerOnOrders)
            .values({
              offer_id: offer.id,
              user_id: user?.id,
              discount_total: totalDiscount,
            })
            .returning();

          offerOnOrder = createOfferOnOrder;
        }

        await tx.insert(tb.orders).values({
          payment_snapshot_id: createPaymentSnapshot.id,
          product_snapshot_id: createProductSnapshot.id,
          user_id: user?.id,
          total_price: createPayment.data.amount,
          discount_price: totalDiscount,
          cost_price: product.products.provider_price,
          fee: createPayment.data.total_fee,
          profit: profit,
          sn_number: '',
          order_id: orderId,
          offer_on_order_id: offerOnOrder?.id ?? null,
          payment_status: createPayment.data.status,
          order_status:
            createPayment.data.status == PaymentStatus.SUCCESS
              ? OrderStatus.PENDING
              : OrderStatus.NONE,
          customer_input: merged,
        });

        if (createPayment.data.status == PaymentStatus.SUCCESS) {
          await this.queueService.addOrderJob(orderId);
        }

        if (createPayment.data.status == PaymentStatus.PENDING) {
          const delay =
            new Date(createPayment.data.expired_at).getTime() - Date.now();

          await this.queueService.addExpiredOrderJob(orderId, delay);
        }

        return {
          paymentMethod,
          offer,
          fee,
          totalPrice,
          totalDiscount,
          orderId,
          createPayment,
        };
      });

    const buildResponse = {
      product: {
        category: product.product_categories.name,
        sub_category: product.product_sub_categories.name,
        name: product.products.name,
        price: product.products.price,
      },
      payment_method: {
        id: paymentMethod.id,
        name: paymentMethod.name,
        type: paymentMethod.type,
      },
      offer: offer
        ? {
            offer_id: offer.id,
            name: offer.name,
            is_new_user: offer.is_new_user,
            discount_percentage: offer.discount_percentage,
            discount_static: offer.discount_static,
            discount_maximum: offer.discount_maximum,
            min_amount: offer.min_amount,
          }
        : null,

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
        offer_on_order: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.id} not found.`);
    }

    return SendResponse.success(order);
  }

  /**
   * Validate offer, support passing db instance (for transaction)
   */
  private async validateOffer(
    offerId: string | undefined,
    product: {
      products: InferSelectModel<typeof tb.products>;
      product_categories: InferSelectModel<typeof tb.productCategories>;
      product_sub_categories: InferSelectModel<typeof tb.productSubCategories>;
    },
    user: TUser | undefined,
    paymentMethodId: string,
    productId: string,
    dbInstance?: Parameters<
      Parameters<(typeof this.databaseService.db)['transaction']>[0]
    >[0],
  ): Promise<InferSelectModel<typeof tb.offers> | null> {
    const db = dbInstance ?? this.databaseService.db;
    if (!offerId) return null;
    if (!user) {
      throw new BadRequestException(
        'Offer is only available for registered users. Please login first.',
      );
    }

    let offerData: InferSelectModel<typeof tb.offers> | undefined;
    if (dbInstance) {
      // Transaction: use FOR UPDATE
      [offerData] = await db
        .select()
        .from(tb.offers)
        .where(
          and(
            eq(tb.offers.id, offerId),
            eq(tb.offers.is_available, true),
            eq(tb.offers.is_deleted, false),
            gte(tb.offers.quota, 0),
            lte(tb.offers.start_date, new Date()),
            gte(tb.offers.end_date, new Date()),
          ),
        )
        .for('update')
        .limit(1);
    } else {
      // Non-transaction: no FOR UPDATE
      [offerData] = await db
        .select()
        .from(tb.offers)
        .where(
          and(
            eq(tb.offers.id, offerId),
            eq(tb.offers.is_available, true),
            eq(tb.offers.is_deleted, false),
            gte(tb.offers.quota, 0),
          ),
        )
        .limit(1);
    }

    if (!offerData) {
      throw new NotFoundException(
        `Offer with ID ${offerId} not found OR not available.`,
      );
    }
    if (offerData.is_new_user && user) {
      const [countOrderUser] = await db
        .select({ count: count() })
        .from(tb.orders)
        .where(
          and(
            eq(tb.orders.user_id, user.id),
            eq(tb.orders.order_status, OrderStatus.COMPLETED),
          ),
        );
      if (countOrderUser.count > 0) {
        throw new NotAcceptableException(
          'This offer is only available for new users.',
        );
      }
    }

    if (!offerData.is_all_payment_methods) {
      const offerPaymentMethods = await db.query.offerPaymentMethods.findFirst({
        where: and(
          eq(tb.offerPaymentMethods.offer_id, offerId),
          eq(tb.offerPaymentMethods.payment_method_id, paymentMethodId),
        ),
      });
      if (!offerPaymentMethods) {
        throw new NotAcceptableException(
          'This offer is not available for the selected payment method.',
        );
      }
    }
    if (!offerData.is_all_products) {
      const offerProducts = await db.query.offer_products.findFirst({
        where: and(
          eq(tb.offer_products.offer_id, offerId),
          eq(tb.offer_products.product_id, productId),
        ),
      });
      if (!offerProducts) {
        throw new NotAcceptableException(
          'This offer is not available for the selected product.',
        );
      }
    }
    if (!offerData.is_all_users) {
      if (!user) {
        throw new NotAcceptableException(
          'This offer is only available for registered users.',
        );
      }
      const offerUsers = await db.query.offerUsers.findFirst({
        where: and(
          eq(tb.offerUsers.offer_id, offerId),
          eq(tb.offerUsers.user_id, user.id),
        ),
      });
      if (!offerUsers) {
        throw new NotAcceptableException(
          'This offer is not available for the current user.',
        );
      }
    }
    if (offerData.min_amount > product.products.price) {
      throw new NotAcceptableException(
        `This offer requires a minimum amount of ${offerData.min_amount} to use.`,
      );
    }
    return offerData;
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
