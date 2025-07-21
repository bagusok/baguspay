import { Injectable } from '@nestjs/common';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllPayments() {
    const payments =
      await this.databaseService.db.query.paymentMethods.findMany({
        columns: {
          id: true,
          name: true,
          fee_type: true,
          type: true,
          fee_static: true,
          fee_percentage: true,
          image_url: true,
          is_need_email: true,
          is_need_phone_number: true,
          is_available: true,
          is_featured: true,
          label: true,
          min_amount: true,
          max_amount: true,
          cut_off_start: true,
          cut_off_end: true,
        },
      });

    return SendResponse.success<any>(payments);
  }

  async getPaymentCategoriers() {
    const categories =
      await this.databaseService.db.query.paymentMethodCategories.findMany({
        with: {
          payment_methods: {
            columns: {
              id: true,
              name: true,
              fee_type: true,
              type: true,
              fee_static: true,
              fee_percentage: true,
              image_url: true,
              is_need_email: true,
              is_need_phone_number: true,
              is_available: true,
              is_featured: true,
              label: true,
              min_amount: true,
              max_amount: true,
              cut_off_start: true,
              cut_off_end: true,
            },
          },
        },
      });

    return SendResponse.success<any>(categories);
  }
}
