CREATE TYPE "public"."offer_type" AS ENUM('discount', 'flash_sale', 'cashback', 'voucher');--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "type" "offer_type" DEFAULT 'voucher' NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "is_unlimited_date" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "is_unlimited_quota" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "is_one_time_use" boolean DEFAULT true NOT NULL;