ALTER TABLE "orders" DROP CONSTRAINT "orders_payment_snapshot_id_product_snapshots_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_snapshot_id_payment_snapshots_id_fk" FOREIGN KEY ("payment_snapshot_id") REFERENCES "public"."payment_snapshots"("id") ON DELETE no action ON UPDATE no action;