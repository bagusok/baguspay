import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { and, eq, or } from '@repo/db'
import { OfferType, tb, UserRole } from '@repo/db/types'
import type { TUser } from 'src/common/types/meta.type'
import { SendResponse } from 'src/common/utils/response'
import { DatabaseService } from 'src/database/database.service'
import { RedeemVoucherDto } from './offers.dto'
import { OffersRepository } from './offers.repository'

@Injectable()
export class OffersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly offersRepository: OffersRepository,
  ) {}

  async redeemVoucher(data: RedeemVoucherDto, user: TUser) {
    if (user.role === UserRole.GUEST) {
      throw new BadRequestException('Please login to redeem voucher')
    }

    const voucher = await this.offersRepository.findVoucherAvailableByCode(
      data.code,
      data.product_id,
    )

    if (!voucher) {
      throw new NotFoundException(`Voucher not found or not valid for this product`)
    }

    if (voucher.usage_count >= voucher.quota) {
      throw new NotAcceptableException(`Voucher quota limit exceeded`)
    }

    if (!voucher.is_all_users) {
      const voucherUser = await this.offersRepository.findUserOfferPolicy(voucher.id, user.id)

      if (!voucherUser) {
        throw new BadRequestException(`This voucher is not available for you`)
      }
    }

    // validate user eligibility
    const userUsageCount = await this.offersRepository.getUsageOfferByUserCount(voucher.id, user.id)

    if (userUsageCount >= voucher.usage_limit) {
      throw new NotAcceptableException(`You have reached the usage limit for this voucher`)
    }

    return SendResponse.success({
      id: voucher.id,
      name: voucher.name,
      discount_percentage: voucher.discount_percentage,
      discount_static: voucher.discount_static,
      discount_maximum: voucher.discount_maximum,
      min_amount: voucher.min_amount,
      is_available: voucher.is_available,
      quota: voucher.quota,
      start_date: voucher.start_date,
      end_date: voucher.end_date,
      type: voucher.type,
      code: voucher.code,
      usage_limit: voucher.usage_limit,
      usage_count: voucher.usage_count,
    })
  }

  async validateVoucher(offerId: string, productId: string, user: TUser) {
    if (user.role === UserRole.GUEST) {
      throw new BadRequestException('Please login to use voucher')
    }

    const voucher = await this.offersRepository.findVoucherAvailableById(offerId, productId)

    if (!voucher) {
      throw new NotFoundException(`Voucher not found or not valid for this product`)
    }

    if (voucher.usage_count >= voucher.quota) {
      throw new NotAcceptableException(`Voucher quota limit exceeded`)
    }

    if (!voucher.is_all_users) {
      const voucherUser = await this.offersRepository.findUserOfferPolicy(voucher.id, user.id)

      if (!voucherUser) {
        throw new BadRequestException(`This voucher is not available for you`)
      }
    }

    // verify usage user
    const userUsageCount = await this.offersRepository.getUsageOfferByUserCount(voucher.id, user.id)

    // console.log('User usage count:', userUsageCount)

    if (userUsageCount >= voucher.usage_limit) {
      throw new NotAcceptableException(`You have reached the usage limit for this voucher`)
    }

    return voucher
  }

  async getVoucher(voucherId: string, productId: string, user: TUser) {
    const [voucher] = await this.databaseService.db
      .select({
        id: tb.offers.id,
        name: tb.offers.name,
        type: tb.offers.type,
        discount_percentage: tb.offers.discount_percentage,
        discount_static: tb.offers.discount_static,
        discount_maximum: tb.offers.discount_maximum,
        is_all_users: tb.offers.is_all_users,
        is_all_products: tb.offers.is_all_products,
        quota: tb.offers.quota,
        usage_count: tb.offers.usage_count,
        is_combinable_with_voucher: tb.offers.is_combinable_with_voucher,
      })
      .from(tb.offers)
      .leftJoin(
        tb.offer_products,
        and(
          eq(tb.offer_products.offer_id, tb.offers.id),
          eq(tb.offer_products.product_id, productId),
        ),
      )
      .where(
        and(
          eq(tb.offers.id, voucherId),
          or(eq(tb.offers.is_all_products, true), eq(tb.offer_products.product_id, productId)),
          eq(tb.offers.type, OfferType.VOUCHER),
          eq(tb.offers.is_deleted, false),
          eq(tb.offers.is_available, true),
        ),
      )
      .limit(1)

    if (!voucher) {
      throw new NotFoundException(`Voucher not found or not valid for this product`)
    }

    // check usage quota
    if (voucher.usage_count >= voucher.quota) {
      throw new NotAcceptableException(`Voucher quota exhausted`)
    }

    // check user eligibility
    if (!voucher.is_all_users) {
      const [voucherUser] = await this.databaseService.db
        .select({
          id: tb.offerUsers.id,
        })
        .from(tb.offerUsers)
        .where(and(eq(tb.offerUsers.offer_id, voucher.id), eq(tb.offerUsers.user_id, user?.id)))
        .limit(1)

      if (!voucherUser) {
        throw new BadRequestException(`This voucher is not available for you`)
      }
    }

    return voucher
  }
}
