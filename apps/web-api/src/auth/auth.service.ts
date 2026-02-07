import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { LoginIsFrom, UserRegisteredType, UserRole } from '@repo/db/types'
import { compare, hash } from 'bcrypt'
import { LoginDto, RegisterDto } from './auth.dto'
import { AuthRepository } from './auth.repository'
import { type DeviceInfo, getDeviceInfo, isSameDevice } from './utils/device-fingerprint'

interface LoginHeaders {
  deviceId: string
  ip: string
  userAgent: string
}

interface TokenPayload {
  id: string
  role: string
}

// Token expiration constants
const ACCESS_TOKEN_EXPIRY = '24h'
const REFRESH_TOKEN_EXPIRY = '7d'
const ACCESS_TOKEN_MS = 24 * 60 * 60 * 1000 // 24 hours
const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Determine login source based on device info
 */
function getLoginSource(deviceInfo: DeviceInfo): LoginIsFrom {
  if (deviceInfo.isBagusPayApp) {
    return LoginIsFrom.MOBILE_APP
  }
  if (deviceInfo.deviceType === 'mobile') {
    return LoginIsFrom.MOBILE
  }
  if (deviceInfo.deviceType === 'desktop') {
    return LoginIsFrom.DESKTOP
  }
  return LoginIsFrom.WEB
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    readonly _configService: ConfigService,
  ) {}

  private generateTokens(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRY })
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_MS)
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MS)

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    }
  }

  async register(data: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(data.email)

    if (existingUser) {
      throw new BadRequestException('Email already exists')
    }

    const hashedPassword = await hash(data.password, 10)
    await this.authRepository.createUser({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: UserRole.USER,
    })

    return {
      success: true,
      message: 'User registered successfully',
    }
  }

  async login(data: LoginDto, headers: LoginHeaders) {
    const user = await this.authRepository.findUserByEmail(data.email)

    if (!user) {
      throw new BadRequestException('Invalid email or password')
    }

    const isPasswordValid = await compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password')
    }

    // Generate device info and fingerprint
    const deviceInfo = getDeviceInfo(headers.deviceId, headers.userAgent)
    const deviceName = deviceInfo.isBagusPayApp
      ? `BagusPay App (${deviceInfo.appInfo?.deviceModel || deviceInfo.os})`
      : `${deviceInfo.browser} on ${deviceInfo.os}`

    const tokens = this.generateTokens({ id: user.id, role: user.role })

    const sessionData = {
      user_id: user.id,
      device_id: headers.deviceId,
      device_fingerprint: deviceInfo.fingerprint,
      device_name: deviceName,
      ip_address: headers.ip,
      user_agent: headers.userAgent,
      login_type: UserRegisteredType.LOCAL,
      is_from: getLoginSource(deviceInfo),
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      access_token_expires_at: tokens.accessTokenExpiresAt,
      refresh_token_expires_at: tokens.refreshTokenExpiresAt,
    }

    // Find existing session using fingerprint (primary) or device_id (fallback)
    let existingSession = await this.authRepository.findSessionByUserAndDevice(
      user.id,
      headers.deviceId,
      deviceInfo.fingerprint,
    )

    // If no session found by fingerprint/deviceId, check all user sessions for similar devices
    if (!existingSession) {
      const allUserSessions = await this.authRepository.findAllSessionsByUserId(user.id)

      for (const session of allUserSessions) {
        const isSame = isSameDevice(
          { deviceId: headers.deviceId, userAgent: headers.userAgent, ip: headers.ip },
          { deviceId: session.device_id, userAgent: session.user_agent, ip: session.ip_address },
        )

        if (isSame) {
          existingSession = session
          break
        }
      }
    }

    if (existingSession) {
      await this.authRepository.updateSession(existingSession.id, sessionData)
    } else {
      await this.authRepository.createSession(sessionData)
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        access_token_expired_at: tokens.accessTokenExpiresAt,
        refresh_token_expired_at: tokens.refreshTokenExpiresAt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_banned: user.is_banned,
          role: user.role,
        },
        device: {
          name: deviceName,
          fingerprint: deviceInfo.fingerprint,
          type: deviceInfo.deviceType,
          is_baguspay_app: deviceInfo.isBagusPayApp,
          login_from: getLoginSource(deviceInfo),
          ...(deviceInfo.isBagusPayApp &&
            deviceInfo.appInfo && {
              app_version: deviceInfo.appInfo.appVersion,
              device_model: deviceInfo.appInfo.deviceModel,
            }),
        },
      },
    }
  }

  async logout(accessToken: string) {
    const session = await this.authRepository.findSessionByAccessToken(accessToken)

    if (!session) {
      throw new BadRequestException('Session not found')
    }

    await this.authRepository.deleteSession(session.id)

    return {
      success: true,
      message: 'Logout successful',
    }
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    try {
      await this.jwtService.verify(refreshToken)
    } catch {
      throw new BadRequestException('Invalid or expired refresh token')
    }

    // Find session by refresh token
    const session = await this.authRepository.findSessionByRefreshToken(refreshToken)

    if (!session) {
      throw new BadRequestException('Session not found')
    }

    // Check if refresh token is expired
    if (session.refresh_token_expires_at < new Date()) {
      await this.authRepository.deleteSession(session.id)
      throw new BadRequestException('Refresh token has expired. Please login again.')
    }

    // Generate new tokens
    const tokens = this.generateTokens({ id: session.user.id, role: session.user.role })

    // Update session with new tokens
    await this.authRepository.updateSession(session.id, {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      access_token_expires_at: tokens.accessTokenExpiresAt,
      refresh_token_expires_at: tokens.refreshTokenExpiresAt,
    })

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        access_token_expired_at: tokens.accessTokenExpiresAt,
        refresh_token_expired_at: tokens.refreshTokenExpiresAt,
      },
    }
  }
}
