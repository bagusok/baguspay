ALTER TABLE "offer_on_orders" RENAME COLUMN "discount_static" TO "discount_total";--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "is_allow_guest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "usage_limit" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "offer_voucher_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_voucher_id_offer_on_orders_id_fk" FOREIGN KEY ("offer_voucher_id") REFERENCES "public"."offer_on_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" DROP COLUMN "is_one_time_use";