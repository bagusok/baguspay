import { InferSelectModel } from '@repo/db';
import { tb } from '@repo/db/types';

export interface MetaPaginated {
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type TUser = InferSelectModel<typeof tb.users>;
