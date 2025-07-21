import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { db } from '@repo/db';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('DatabaseService');

  public db: typeof db;

  onModuleInit() {
    this.logger.log('Initializing database connection...');
    this.db = db;
  }

  async onModuleDestroy() {
    this.logger.log('Closing database connection...');
    await db.$client.end();
  }
}
