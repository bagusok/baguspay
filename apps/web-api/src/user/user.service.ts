import { Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, lte, SQL } from '@repo/db';
import { tb } from '@repo/db/types';
import { MetaPaginated, TUser } from 'src/common/types/meta.type';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { GetBalanceMutationHistoryQuery } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

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
}
