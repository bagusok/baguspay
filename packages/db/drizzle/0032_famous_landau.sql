ALTER TABLE "orders" ADD COLUMN "price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_snapshots" DROP COLUMN "total_price";