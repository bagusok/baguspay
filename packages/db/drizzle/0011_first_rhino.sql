ALTER TABLE "deposits" ADD COLUMN "ref_id" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "pay_code" varchar(100);--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "pay_url" varchar;