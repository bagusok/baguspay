ALTER TABLE "users" ADD COLUMN "pin_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pin_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pin_locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pin_set_at" timestamp with time zone;