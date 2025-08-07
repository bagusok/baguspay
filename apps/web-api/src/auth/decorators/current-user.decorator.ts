import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TUser } from 'src/common/types/meta.type';

interface RequestWithUser extends Request {
  user?: TUser | null;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TUser | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user || null;
  },
);
