ALTER TABLE "deposits" DROP CONSTRAINT "deposits_payment_method_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;