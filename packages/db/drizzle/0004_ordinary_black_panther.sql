ALTER TABLE "payment_methods" ADD COLUMN "provider_code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "expired_in" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD COLUMN "expired_at" timestamp with time zone NOT NULL;