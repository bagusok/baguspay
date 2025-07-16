// app/auth/session_prisma_user_provider.ts
import { symbols } from '@adonisjs/auth'
import type { SessionGuardUser, SessionUserProviderContract } from '@adonisjs/auth/types/session'
import { db, eq, InferSelectModel } from '@repo/db'
import { tb } from '@repo/db/types'

type User = InferSelectModel<typeof tb.users>

export class SessionDrizzleUserProvider implements SessionUserProviderContract<User> {
  declare [symbols.PROVIDER_REAL_USER]: User

  async createUserForGuard(user: User): Promise<SessionGuardUser<User>> {
    return {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }
  }

  async findById(identifier: string): Promise<SessionGuardUser<User> | null> {
    const user = await db.query.users.findFirst({
      where: eq(tb.users.id, identifier),
    })

    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }

  /**
   * Jika kamu juga ingin login pakai email misalnya:
   */
  async findByUid(uid: string): Promise<SessionGuardUser<User> | null> {
    const user = await db.query.users.findFirst({
      where: eq(tb.users.email, uid),
    })

    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }

  /**
   * Untuk validasi password secara manual
   */
  //   async verifyPassword(user: User, plainPassword: string): Promise<boolean> {
  //     const Hash = (await import('@adonisjs/core/hash')).default
  //     return Hash.verify(user.password, plainPassword)
  //   }
}
