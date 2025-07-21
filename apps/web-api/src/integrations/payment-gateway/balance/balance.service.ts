import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq, sql } from '@repo/db';
import {
  BalanceMutationRefType,
  BalanceMutationType,
  tb,
} from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async addBalance(data: AddBalanceRequest) {
    const [, addMutation, updatedUser] =
      await this.databaseService.db.transaction(
        async (tx) => {
          const [user] = await tx
            .select()
            .from(tb.users)
            .where(eq(tb.users.id, data.userId))
            .for('update');

          if (!user) {
            throw new UnprocessableEntityException(
              `User with ID ${data.userId} not found`,
            );
          }

          const [addMutation] = await tx
            .insert(tb.balanceMutations)
            .values({
              name: data.name,
              user_id: data.userId,
              amount: data.amount,
              ref_type: data.ref_type,
              ref_id: data.ref_id || '',
              type: data.type,
              notes: data.notes || '',
              balance_after: sql`${user.balance}::int + ${data.amount}::int`,
              balance_before: user.balance,
            })
            .returning();

          const [updatedUser] = await tx
            .update(tb.users)
            .set({
              balance: sql`${user.balance}::int + ${data.amount}::int`,
            })
            .where(eq(tb.users.id, data.userId))
            .returning();

          return [user, addMutation, updatedUser];
        },
        {
          isolationLevel: 'read committed',
          accessMode: 'read write',
        },
      );

    return SendResponse.success({
      user: updatedUser,
      mutation: addMutation,
    });
  }

  async deductBalance(data: AddBalanceRequest) {
    const [, deductMutation, updatedUser] =
      await this.databaseService.db.transaction(
        async (tx) => {
          const [user] = await tx
            .select()
            .from(tb.users)
            .where(eq(tb.users.id, data.userId))
            .for('update');

          if (!user) {
            throw new UnprocessableEntityException(
              `User with ID ${data.userId} not found`,
            );
          }

          if (user.balance < data.amount) {
            throw new UnprocessableEntityException(
              `Insufficient balance for user with ID ${data.userId}`,
            );
          }

          const [deductMutation] = await tx
            .insert(tb.balanceMutations)
            .values({
              name: data.name,
              user_id: data.userId,
              amount: -data.amount,
              ref_type: data.ref_type,
              ref_id: data.ref_id || '',
              type: data.type,
              notes: data.notes || '',
              balance_after: sql`${user.balance} - ${data.amount}`,
              balance_before: user.balance,
            })
            .returning();

          const [updatedUser] = await tx
            .update(tb.users)
            .set({
              balance: sql`${user.balance} - ${data.amount}`,
            })
            .where(eq(tb.users.id, data.userId));

          return [user, deductMutation, updatedUser];
        },
        {
          isolationLevel: 'read committed',
          accessMode: 'read write',
        },
      );

    return SendResponse.success({
      user: updatedUser,
      mutation: deductMutation,
    });
  }
}

type AddBalanceRequest = {
  name: string;
  userId: string;
  amount: number;
  ref_type: BalanceMutationRefType;
  ref_id?: string;
  type: BalanceMutationType;
  notes?: string;
};
