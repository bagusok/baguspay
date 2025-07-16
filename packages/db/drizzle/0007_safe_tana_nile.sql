ALTER TYPE "public"."payment_method_type" ADD VALUE 'link_payment' BEFORE 'manual';--> statement-breakpoint
ALTER TABLE "product_categories" RENAME COLUMN "is_active" TO "is_available";--> statement-breakpoint
ALTER TABLE "product_sub_categories" RENAME COLUMN "is_active" TO "is_available";--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "is_need_phone_number" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "is_need_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "pay_code" varchar(100);--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "pay_url" varchar;