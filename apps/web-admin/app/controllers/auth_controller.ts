import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { db, eq, or } from '@repo/db'
import { tb, UserRegisteredType, UserRole } from '@repo/db/types'
import vine from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async register({ inertia }: HttpContext) {
    return inertia.render('auth/register', {
      title: 'Register',
      description: 'Create a new account to access the admin panel.',
    })
  }

  public async postRegister(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(registerValidator))

    const user = await db.query.users.findFirst({
      where: or(eq(tb.users.email, data.email), eq(tb.users.phone, data.phone)),
    })

    if (user) {
      ctx.session.flashErrors({
        error: 'Email or phone number already exists.',
      })
      return ctx.response.redirect().back()
    }

    // const hashedPassword = await hash(data.password, 10)
    const hashedPassword = await hash.make(data.password)

    const newUser = await db
      .insert(tb.users)
      .values({
        role: UserRole.USER,
        registered_type: UserRegisteredType.LOCAL,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      })
      .returning()

    if (newUser.length === 0) {
      ctx.session.flashErrors({
        error: 'Failed to create user. Please try again later.',
      })
      return ctx.response.redirect().back()
    }

    ctx.session.flashMessages.set('success', 'User registered successfully. You can now log in.')
    return ctx.response.redirect().toRoute('auth.login')
  }

  public async login({ inertia }: HttpContext) {
    return inertia.render('auth/login', {
      title: 'Login',
      description: 'Access the admin panel with your account.',
    })
  }

  public async postLogin(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(loginValidator))

    const user = await db.query.users.findFirst({
      where: eq(tb.users.email, data.email),
    })

    if (!user) {
      ctx.session.flashErrors({
        error: 'Invalid email or password.',
      })
      return ctx.response.redirect().back()
    }

    const isPasswordValid = await hash.verify(user.password, data.password)

    if (!isPasswordValid) {
      ctx.session.flashErrors({
        error: 'Invalid email or password.',
      })
      return ctx.response.redirect().back()
    }

    await ctx.auth.use('web').login(user)

    const a = await ctx.auth.use('web').authenticate()
    console.log('Authenticated User:', a)

    ctx.session.flashMessages.set('success', 'You have been logged in successfully.')
    return ctx.response.redirect().toRoute('home.index')
  }

  public async logout(ctx: HttpContext) {
    ctx.auth.use('web').logout()

    ctx.session.flashMessages.set('success', 'You have been logged out successfully.')
    return ctx.response.redirect().toRoute('auth.login')
  }
}
