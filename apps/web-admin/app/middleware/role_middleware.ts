import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '@repo/db/types'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, ...roles: UserRole[]) {
    await ctx.auth.authenticateUsing(['web'], { loginRoute: '/auth/login' })
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.redirect().toRoute('auth.login')
    }

    if (!roles.includes(user?.role)) {
      return ctx.response
        .status(403)
        .send('Forbidden: You do not have permission to access this resource.')
    }

    await next()
  }
}
