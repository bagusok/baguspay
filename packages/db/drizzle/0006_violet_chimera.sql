ALTER TABLE "payment_methods" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cut_off_start" time with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cut_off_end" time with time zone;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "cut_off_start" time with time zone;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "cut_off_end" time with time zone;