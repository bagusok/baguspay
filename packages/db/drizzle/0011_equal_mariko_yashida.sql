ALTER TABLE "sessions" ADD COLUMN "device_fingerprint" varchar(64);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "device_name" varchar(255);