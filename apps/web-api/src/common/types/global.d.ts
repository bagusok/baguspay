import { InferSelectModel } from '@repo/db';
import { tb } from '@repo/db/types';

declare module 'express' {
  interface Request {
    user?: Omit<TUser, 'password'>;
  }
}

export type TUser = InferSelectModel<typeof tb.users>;
