import { Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, lte, sql, SQL, sum } from '@repo/db';
import {
  BalanceMutationType,
  DepositStatus,
  OrderStatus,
  tb,
} from '@repo/db/types';
import { MetaPaginated, TUser } from 'src/common/types/meta.type';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { StorageService } from 'src/storage/storage.service';
import { GetBalanceMutationHistoryQuery } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: StorageService,
  ) {}

  async getUserById(id: string) {
    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.id, id),
      columns: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        balance: true,
        registered_type: true,
        is_banned: true,
        image_url: true,
        is_email_verified: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.image_url) {
      user.image_url = this.storageService.getFileUrl(user.image_url);
    }

    return SendResponse.success(user, 'User profile retrieved successfully');
  }

  async getBalance(userId: string) {
    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.id, userId),
      columns: {
        balance: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return SendResponse.success(
      { balance: user.balance },
      'User balance retrieved successfully',
    );
  }

  async getBalanceMutationHistory(
    query: GetBalanceMutationHistoryQuery,
    userId: string,
  ) {
    const where: SQL[] = [eq(tb.balanceMutations.user_id, userId)];

    if (query.start_date) {
      where.push(
        gte(tb.balanceMutations.created_at, new Date(query.start_date)),
      );
    }

    if (query.end_date) {
      where.push(lte(tb.balanceMutations.created_at, new Date(query.end_date)));
    }

    if (query.ref_type) {
      where.push(eq(tb.balanceMutations.ref_type, query.ref_type));
    }

    if (query.type) {
      where.push(eq(tb.balanceMutations.type, query.type));
    }

    const mutations =
      await this.databaseService.db.query.balanceMutations.findMany({
        where: and(...where),
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
        orderBy: desc(tb.balanceMutations.created_at),
        columns: {
          id: true,
          amount: true,
          name: true,
          ref_type: true,
          ref_id: true,
          created_at: true,
          type: true,
        },
      });

    const [totalData] = await this.databaseService.db
      .select({
        count: count(),
      })
      .from(tb.balanceMutations)
      .where(and(...where));

    return SendResponse.success<typeof mutations, MetaPaginated>(
      mutations,
      'Balance mutation history retrieved successfully',
      {
        meta: {
          total: totalData.count,
          page: query.page,
          limit: query.limit,
          total_pages: Math.ceil(totalData.count / query.limit),
        },
      },
    );
  }

  me(user?: TUser) {
    if (!user) {
      return SendResponse.success({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'guest@baguspay.com',
        name: 'Guest',
        phone: null,
        role: 'guest',
        balance: 0,
        is_banned: false,
        is_email_verified: false,
        image_url: null,
      });
    } else {
      return SendResponse.success(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          is_banned: user.is_banned,
          is_email_verified: user.is_email_verified,
          image_url: user.image_url,
        },
        'User profile retrieved successfully',
      );
    }
  }

  async dashboard(user: TUser) {
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [
      balance,
      total,
      monthlyExpenses,
      monthlyIncome,
      totalDeposit,
      recentOrder,
      popularOrder,
      monthlyOrderSuccess,
    ] = await Promise.all([
      this.databaseService.db.query.users.findFirst({
        where: eq(tb.users.id, user.id),
      }),
      this.databaseService.db
        .select({
          totalPrice: sum(tb.orders.total_price),
          totalPromo: sum(tb.orders.discount_price),
          totalOrder: count(tb.orders.id),
        })
        .from(tb.orders)
        .where(
          and(
            eq(tb.orders.user_id, user.id),
            eq(tb.orders.order_status, OrderStatus.COMPLETED),
          ),
        )
        .limit(1),
      // Monthly expenses (negative balance mutations)
      this.databaseService.db
        .select({
          totalExpenses: sum(tb.balanceMutations.amount),
        })
        .from(tb.balanceMutations)
        .where(
          and(
            eq(tb.balanceMutations.user_id, user.id),
            eq(tb.balanceMutations.type, BalanceMutationType.DEBIT),
            gte(tb.balanceMutations.created_at, monthStart),
            lte(tb.balanceMutations.created_at, monthEnd),
          ),
        )
        .limit(1),
      // Monthly income (positive balance mutations)
      this.databaseService.db
        .select({
          totalIncome: sum(tb.balanceMutations.amount),
        })
        .from(tb.balanceMutations)
        .where(
          and(
            eq(tb.balanceMutations.user_id, user.id),
            eq(tb.balanceMutations.type, BalanceMutationType.CREDIT),
            gte(tb.balanceMutations.created_at, monthStart),
            lte(tb.balanceMutations.created_at, monthEnd),
          ),
        )
        .limit(1),
      // Total deposits
      this.databaseService.db
        .select({
          totalDeposit: sum(tb.deposits.amount_received),
        })
        .from(tb.deposits)
        .where(
          and(
            eq(tb.deposits.user_id, user.id),
            eq(tb.deposits.status, DepositStatus.COMPLETED),
          ),
        )
        .limit(1),

      // Recent Orders
      this.databaseService.db.query.orders.findMany({
        where: eq(tb.orders.user_id, user.id),

        orderBy: desc(tb.orders.created_at),
        limit: 5,
        columns: {
          order_id: true,
          total_price: true,
          order_status: true,
          payment_status: true,
          customer_input: true,
          created_at: true,
        },
        with: {
          product_snapshot: {
            columns: {
              name: true,
              category_name: true,
              sub_category_name: true,
            },
          },
        },
      }),

      // Orderan Populer Bulan ini
      this.databaseService.db
        .select({
          category_name: tb.productSnapshots.category_name,
          total: count(tb.orders.id).as('total'), // beri alias agar bisa digunakan di orderBy
        })
        .from(tb.orders)
        .innerJoin(
          tb.productSnapshots,
          eq(tb.orders.product_snapshot_id, tb.productSnapshots.id),
        )
        .where(
          and(
            eq(tb.orders.user_id, user.id),
            eq(tb.orders.order_status, OrderStatus.COMPLETED),
            gte(tb.orders.created_at, monthStart),
            lte(tb.orders.created_at, monthEnd),
          ),
        )
        .groupBy(tb.productSnapshots.category_name)
        .orderBy(desc(sql`count(${tb.orders.id})`))
        .limit(5),

      // jumlah orderan sukses bulan ini
      this.databaseService.db
        .select({
          totalPrice: sum(tb.orders.total_price),
          totalPromo: sum(tb.orders.discount_price),
          totalOrder: count(tb.orders.id),
        })
        .from(tb.orders)
        .where(
          and(
            eq(tb.orders.user_id, user.id),
            eq(tb.orders.order_status, OrderStatus.COMPLETED),
            gte(tb.orders.created_at, monthStart),
            lte(tb.orders.created_at, monthEnd),
          ),
        )
        .limit(1),
    ]);

    return SendResponse.success({
      balance: balance.balance,
      totalOrder: total[0].totalOrder || 0,
      totalOrderPrice: total[0].totalPrice || 0,
      totalPromoPrice: total[0].totalPromo || 0,
      monthlyExpenses: monthlyExpenses[0]?.totalExpenses || 0,
      monthlyIncome: monthlyIncome[0]?.totalIncome || 0,
      monthlyOrderSuccess: monthlyOrderSuccess[0]?.totalOrder || 0,
      monthlyOrderSuccessPrice: monthlyOrderSuccess[0]?.totalPrice || 0,
      monthlyOrderSuccessPromo: monthlyOrderSuccess[0]?.totalPromo || 0,
      totalDeposit: totalDeposit[0].totalDeposit || 0,
      recentOrders: recentOrder,
      popularOrders: popularOrder,
    });
  }
}
