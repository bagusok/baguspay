ALTER TYPE "public"."product_category_type" ADD VALUE 'aktivasi_perdana' BEFORE 'pulsa';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'aktivasi_voucher' BEFORE 'pulsa';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'e_money' BEFORE 'pulsa';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'e_wallet' BEFORE 'pulsa';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'e_wallet_bebas_nominal' BEFORE 'pulsa';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'masa_aktif' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'telepon_dan_sms' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'pln_prepaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'pln_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'pln_non_taglist' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'pdam' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'pulsa_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'kuota_recomendation' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'internet_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'bpjs_keuangan_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'bpjs_ketenagakerjaan_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'multifinanc_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'pbb_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'gas_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_category_type" ADD VALUE 'insurance_postpaid' BEFORE 'entertainment';--> statement-breakpoint
ALTER TYPE "public"."product_grouping_menu_type" ADD VALUE 'category_menu';--> statement-breakpoint
ALTER TYPE "public"."product_grouping_menu_type" ADD VALUE 'other_menu';--> statement-breakpoint
ALTER TYPE "public"."product_grouping_type" ADD VALUE 'category';--> statement-breakpoint
ALTER TABLE "product_groupings" ADD COLUMN "app_key" varchar(100);--> statement-breakpoint
ALTER TABLE "product_groupings" ADD COLUMN "is_special_feature" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_groupings" ADD COLUMN "special_feature_key" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "transaction_ref" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_input_json" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_device_id" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "additional_data" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_raw_response" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "callback_raw_response" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_success_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_success_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "profit_max" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "profit_min" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_snapshots" ADD COLUMN "is_special_feature" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_snapshots" ADD COLUMN "special_feature_key" varchar(50);--> statement-breakpoint
ALTER TABLE "product_snapshots" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "raw_response";