import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { and, eq, or } from '@repo/db';
import { tb, UserRegisteredType, UserRole } from '@repo/db/types';
import { compare, hash } from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.email, data.email),
    });

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hash(data.password, 10);
    await this.databaseService.db.insert(tb.users).values({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: UserRole.USER,
    });

    return {
      success: true,
      message: 'User registered successfully',
    };
  }

  async login(
    data: LoginDto,
    headers: {
      deviceId: string;
      ip: string;
      userAgent: string;
    },
  ) {
    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.email, data.email),
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const accesTokenExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const refreshTokenExpiredAt = new Date(
      Date.now() + 604800 * 1000, // 7 days
    );

    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const existingSession =
      await this.databaseService.db.query.sessions.findFirst({
        where: and(
          eq(tb.sessions.user_id, user.id),
          or(
            eq(tb.sessions.device_id, headers.deviceId),
            eq(tb.sessions.ip_address, headers.ip),
            eq(tb.sessions.user_agent, headers.userAgent),
          ),
        ),
      });

    if (existingSession) {
      await this.databaseService.db
        .update(tb.sessions)
        .set({
          ip_address: headers.ip,
          user_agent: headers.userAgent,
          user_id: user.id,
          device_id: headers['x-device-id'],
          login_type: UserRegisteredType.LOCAL,
          access_token: accessToken,
          refresh_token: refreshToken,
          access_token_expires_at: accesTokenExpiredAt,
          refresh_token_expires_at: refreshTokenExpiredAt,
        })
        .where(eq(tb.sessions.id, existingSession.id));
    } else {
      await this.databaseService.db.insert(tb.sessions).values({
        user_id: user.id,
        device_id: headers['x-device-id'],
        ip_address: headers.ip,
        user_agent: headers.userAgent,
        login_type: UserRegisteredType.LOCAL,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: accesTokenExpiredAt,
        refresh_token_expires_at: refreshTokenExpiredAt,
      });
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expired_at: accesTokenExpiredAt,
        refresh_token_expired_at: refreshTokenExpiredAt,
      },
    };
  }

  async logout(accessToken: string) {
    const session = await this.databaseService.db.query.sessions.findFirst({
      where: eq(tb.sessions.access_token, accessToken),
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    await this.databaseService.db
      .delete(tb.sessions)
      .where(eq(tb.sessions.id, session.id));

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
