CREATE TYPE "public"."inquiry_status" AS ENUM('AWAIT_CONFIRMATION', 'CONFIRMED', 'USED', 'EXPIRED', 'FAILED', 'CANCELED');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid,
	"product_snapshot_id" uuid,
	"payment_snapshot_id" uuid,
	"price" integer DEFAULT 0 NOT NULL,
	"cost_price" integer DEFAULT 0 NOT NULL,
	"discount_price" integer DEFAULT 0 NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"admin_fee" integer DEFAULT 0 NOT NULL,
	"total_price" integer NOT NULL,
	"profit" integer DEFAULT 0 NOT NULL,
	"inquiry_provider" "product_provider" DEFAULT 'digiflazz' NOT NULL,
	"inquiry_provider_code" varchar(50),
	"inquiry_ref_id" varchar(100),
	"inquiry_response" jsonb,
	"customer_input" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"customer_name" varchar(150),
	"customer_phone" varchar(50),
	"customer_email" varchar(150),
	"status" "inquiry_status" DEFAULT 'AWAIT_CONFIRMATION',
	"expired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "inquiry_id" uuid;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_product_snapshot_id_product_snapshots_id_fk" FOREIGN KEY ("product_snapshot_id") REFERENCES "public"."product_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_payment_snapshot_id_payment_snapshots_id_fk" FOREIGN KEY ("payment_snapshot_id") REFERENCES "public"."payment_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiries_user_idx" ON "inquiries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;