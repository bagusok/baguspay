ALTER TABLE "orders" DROP CONSTRAINT "orders_offer_on_order_id_offer_on_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_offer_voucher_id_offer_on_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "offer_on_orders" ADD COLUMN "order_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_on_orders" ADD CONSTRAINT "offer_on_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "offer_on_order_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "offer_voucher_id";