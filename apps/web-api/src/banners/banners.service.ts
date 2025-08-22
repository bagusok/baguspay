import { Injectable } from '@nestjs/common';
import { desc, eq } from '@repo/db';
import { tb } from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BannersService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async getAllBanners() {
    const banners = await this.databaseService.db.query.banners.findMany({
      where: eq(tb.banners.is_available, true),
      orderBy: desc(tb.banners.created_at),
      columns: {
        id: true,
        title: true,
        image_url: true,
        description: true,
        created_at: true,
      },
    });

    return SendResponse.success(banners);
  }

  public async getBannerById(id: string) {
    await this.databaseService.db.delete(tb.banners);
  }
}
