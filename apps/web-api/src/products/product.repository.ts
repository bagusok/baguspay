import { Injectable } from '@nestjs/common'
import { eq, sql } from '@repo/db'
import { tb } from '@repo/db/types'
import type { DBInstance } from 'src/common/types/db-instance'
import type { DatabaseService } from 'src/database/database.service'

@Injectable()
export class ProductRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async decreaseProductStockByProductId(productId: string, value = 1, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    return await db
      .update(tb.products)
      .set({
        stock: sql`${tb.products.stock} - ${value}`,
      })
      .where(eq(tb.products.id, productId))
  }

  async increaseProductStockByProductId(productId: string, value = 1, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    return await db
      .update(tb.products)
      .set({
        stock: sql`${tb.products.stock} + ${value}`,
      })
      .where(eq(tb.products.id, productId))
  }
}
