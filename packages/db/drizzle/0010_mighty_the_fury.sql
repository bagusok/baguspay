ALTER TYPE "public"."deposit_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "expired_at" timestamp with time zone NOT NULL;