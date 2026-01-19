import { Injectable } from '@nestjs/common'
import { eq } from '@repo/db'
import { DepositStatus, tb } from '@repo/db/types'
import { DBInstance } from 'src/common/types/db-instance'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class DepositRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findDepositById(depositId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const deposit = await db.query.deposits.findFirst({
      where: eq(tb.deposits.deposit_id, depositId),
    })

    return deposit
  }

  async updateDepositStatus(depositId: string, status: DepositStatus, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    return await db
      .update(tb.deposits)
      .set({
        status: status,
      })
      .where(eq(tb.deposits.deposit_id, depositId))
  }
}
