ALTER TABLE "payment_snapshots" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "pay_code" varchar(100);--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "pay_url" varchar;--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "pay_code";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "pay_url";--> statement-breakpoint
ALTER TABLE "payment_snapshots" DROP COLUMN "min_amount";--> statement-breakpoint
ALTER TABLE "payment_snapshots" DROP COLUMN "max_amount";