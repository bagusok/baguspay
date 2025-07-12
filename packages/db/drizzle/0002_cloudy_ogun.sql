CREATE INDEX "deposits_deposit_id_index" ON "deposits" USING btree ("deposit_id");--> statement-breakpoint
CREATE INDEX "orders_order_id_index" ON "orders" USING btree ("order_id");