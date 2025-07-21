import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { eq } from '@repo/db';
import { tb, UserRole } from '@repo/db/types';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  public async validate(req: Request, payload: JwtPayload): Promise<any> {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const validateToken =
      await this.databaseService.db.query.sessions.findFirst({
        where: eq(tb.sessions.access_token, accessToken),
        with: {
          user: true,
        },
      });

    if (!validateToken) {
      throw new UnauthorizedException('Invalid access token');
    }

    return validateToken.user;
  }
}

export type JwtPayload = {
  id: string;
  role: typeof UserRole;
};
