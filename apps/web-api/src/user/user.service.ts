import { Injectable, NotFoundException } from '@nestjs/common'
import { eq, gte, lte, SQL } from '@repo/db'
import { BalanceMutationType, LoginIsFrom, tb } from '@repo/db/types'
import { getDeviceInfo, isBagusPayMobileApp } from 'src/auth/utils/device-fingerprint'
import { MetaPaginated, TUser } from 'src/common/types/meta.type'
import { SendResponse } from 'src/common/utils/response'
import { StorageService } from 'src/storage/storage.service'
import { GetBalanceMutationHistoryQuery } from './user.dto'
import { DateRange, UserRepository } from './user.repository'

/**
 * Get human-readable client type label
 */
function getClientTypeLabel(isFrom: LoginIsFrom | null): string {
  switch (isFrom) {
    case LoginIsFrom.MOBILE_APP:
      return 'BagusPay App'
    case LoginIsFrom.MOBILE:
      return 'Mobile Browser'
    case LoginIsFrom.DESKTOP:
      return 'Desktop'
    case LoginIsFrom.WEB:
    default:
      return 'Browser'
  }
}

@Injectable()
export class UserService {
  constructor(
    private readonly storageService: StorageService,
    private readonly userRepository: UserRepository,
  ) {}

  private getCurrentMonthRange(): DateRange {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    }
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findUserById(id)

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    if (user.image_url) {
      user.image_url = this.storageService.getFileUrl(user.image_url)
    }

    return SendResponse.success(user, 'User profile retrieved successfully')
  }

  async getBalance(userId: string) {
    const user = await this.userRepository.findUserById(userId)

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    return SendResponse.success({ balance: user.balance }, 'User balance retrieved successfully')
  }

  async getBalanceMutationHistory(query: GetBalanceMutationHistoryQuery, userId: string) {
    const where: SQL[] = [eq(tb.balanceMutations.user_id, userId)]

    if (query.start_date) {
      where.push(gte(tb.balanceMutations.created_at, new Date(query.start_date)))
    }

    if (query.end_date) {
      where.push(lte(tb.balanceMutations.created_at, new Date(query.end_date)))
    }

    if (query.ref_type) {
      where.push(eq(tb.balanceMutations.ref_type, query.ref_type))
    }

    if (query.type) {
      where.push(eq(tb.balanceMutations.type, query.type))
    }

    const mutations = await this.userRepository.findAllBalanceMutationByUserId(userId, query)

    const totalData = await this.userRepository.countBalanceMutationsByUserId(userId, query)

    return SendResponse.success<typeof mutations, MetaPaginated>(
      mutations,
      'Balance mutation history retrieved successfully',
      {
        meta: {
          total: totalData,
          page: query.page,
          limit: query.limit,
          total_pages: Math.ceil(totalData / query.limit),
        },
      },
    )
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
      })
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
      )
    }
  }

  async dashboard(user: TUser) {
    const monthRange = this.getCurrentMonthRange()

    const [
      userData,
      orderStats,
      monthlyExpenses,
      monthlyIncome,
      totalDeposit,
      recentOrders,
      popularOrders,
      monthlyOrderStats,
    ] = await Promise.all([
      this.userRepository.findUserById(user.id),
      this.userRepository.getOrderStats(user.id),
      this.userRepository.getBalanceMutationSum(user.id, BalanceMutationType.DEBIT, monthRange),
      this.userRepository.getBalanceMutationSum(user.id, BalanceMutationType.CREDIT, monthRange),
      this.userRepository.getTotalDeposit(user.id),
      this.userRepository.getRecentOrders(user.id),
      this.userRepository.getPopularOrderCategories(user.id, monthRange),
      this.userRepository.getMonthlyOrderStats(user.id, monthRange),
    ])

    return SendResponse.success({
      balance: userData?.balance ?? 0,
      totalOrder: orderStats?.totalOrder ?? 0,
      totalOrderPrice: orderStats?.totalPrice ?? 0,
      totalPromoPrice: orderStats?.totalPromo ?? 0,
      monthlyExpenses,
      monthlyIncome,
      monthlyOrderSuccess: monthlyOrderStats?.totalOrder ?? 0,
      monthlyOrderSuccessPrice: monthlyOrderStats?.totalPrice ?? 0,
      monthlyOrderSuccessPromo: monthlyOrderStats?.totalPromo ?? 0,
      totalDeposit,
      recentOrders,
      popularOrders,
    })
  }

  // Session
  async getAllSessions(user: TUser, currentAccessToken?: string) {
    const sessions = await this.userRepository.findAllSessionByUserId(user.id)

    // Format sessions with device info for display
    const formattedSessions = sessions.map((session) => {
      // Parse device info from user_agent if device_name is not available
      const deviceInfo = getDeviceInfo(session.device_id, session.user_agent)
      const isMobileApp = isBagusPayMobileApp(session.user_agent)

      // Determine device name
      let deviceName = session.device_name
      if (!deviceName) {
        deviceName = isMobileApp
          ? `BagusPay App (${deviceInfo.os})`
          : `${deviceInfo.browser} on ${deviceInfo.os}`
      }

      return {
        id: session.id,
        device_name: deviceName,
        device_type: deviceInfo.deviceType,
        client_type: getClientTypeLabel(session.is_from),
        is_mobile_app: isMobileApp,
        is_from: session.is_from,
        ip_address: session.ip_address,
        is_current_session: currentAccessToken
          ? session.access_token === currentAccessToken
          : false,
        last_active: session.updated_at,
        created_at: session.created_at,
      }
    })

    return SendResponse.success(formattedSessions, 'User sessions retrieved successfully')
  }

  async destroySession(user: TUser, sessionId: string) {
    const [deletedSession] = await this.userRepository.deleteSessionByIdAndUserId(
      sessionId,
      user.id,
    )

    if (!deletedSession) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`)
    }

    return SendResponse.success(null, 'User session destroyed successfully')
  }
}
