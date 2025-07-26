ALTER TABLE "payment_methods" ADD COLUMN "instruction" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_email" varchar(150);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_ip" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_ua" varchar(500);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "voucher_code" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "raw_response" varchar;