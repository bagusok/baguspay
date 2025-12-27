import { db } from '@repo/db';

export type DBInstance = Parameters<
  Parameters<(typeof db)['transaction']>[0]
>[0];
