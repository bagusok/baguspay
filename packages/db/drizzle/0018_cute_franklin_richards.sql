ALTER TABLE "orders" ALTER COLUMN "order_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_id_unique" UNIQUE("order_id");