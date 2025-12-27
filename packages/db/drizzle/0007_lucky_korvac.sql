ALTER TABLE "payment_snapshots" ADD COLUMN "is_need_phone_number" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "payment_phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "is_need_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "payment_email" varchar;