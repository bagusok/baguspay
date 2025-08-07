import { TUser } from './meta.type';

declare module 'express' {
  interface Request {
    user?: Omit<TUser, 'password'>;
  }
}
