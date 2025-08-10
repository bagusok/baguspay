CREATE TYPE "public"."app_platform" AS ENUM('web', 'app');--> statement-breakpoint
CREATE TYPE "public"."balance_mutation_ref_type" AS ENUM('order', 'deposit', 'withdrawal', 'other');--> statement-breakpoint
CREATE TYPE "public"."balance_mutation_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."deposit_status" AS ENUM('pending', 'completed', 'failed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."input_field_type" AS ENUM('text', 'number', 'email', 'password', 'select', 'radio', 'checkbox', 'textarea');--> statement-breakpoint
CREATE TYPE "public"."login_is_from" AS ENUM('web', 'mobile', 'desktop');--> statement-breakpoint
CREATE TYPE "public"."offer_type" AS ENUM('discount', 'flash_sale', 'cashback', 'voucher');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('none', 'pending', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_method_allow_access" AS ENUM('deposit', 'order');--> statement-breakpoint
CREATE TYPE "public"."payment_method_fee_type" AS ENUM('merchant', 'buyer', 'both');--> statement-breakpoint
CREATE TYPE "public"."payment_method_provider" AS ENUM('tripay', 'flipbusiness', 'doku', 'xendit', 'midtrans', 'ipaymu', 'duitku', 'balance', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('bank_transfer', 'virtual_account', 'retail', 'qr_code', 'e_wallet', 'credit_card', 'voucher', 'balance', 'link_payment', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."product_billing_type" AS ENUM('prepaid', 'postpaid');--> statement-breakpoint
CREATE TYPE "public"."product_category_type" AS ENUM('game', 'voucher', 'pulsa', 'kuota', 'entertainment', 'finance', 'ecommerce', 'topup', 'billing', 'send_money', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_fullfillment_type" AS ENUM('manual_direct', 'manual_direct_with_voucher', 'automatic_direct', 'automatic_direct_with_voucher');--> statement-breakpoint
CREATE TYPE "public"."product_grouping_menu_type" AS ENUM('home_menu', 'fast_menu');--> statement-breakpoint
CREATE TYPE "public"."product_grouping_type" AS ENUM('redirect', 'modal');--> statement-breakpoint
CREATE TYPE "public"."product_provider" AS ENUM('digiflazz', 'moogold', 'atlantich2h', 'vipreseller', 'vocagame');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('none', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_registered_type" AS ENUM('google', 'facebook', 'github', 'local');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'guest');--> statement-breakpoint
CREATE TABLE "article_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar NOT NULL,
	"description" varchar(255),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"image_url" varchar(255),
	"slug" varchar NOT NULL,
	"content" text NOT NULL,
	"article_category_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_category_on_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"product_category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "balance_mutations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"type" "balance_mutation_type" NOT NULL,
	"ref_type" "balance_mutation_ref_type" NOT NULL,
	"ref_id" varchar(100) NOT NULL,
	"user_id" uuid NOT NULL,
	"balance_before" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"notes" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"image" varchar NOT NULL,
	"is_available" boolean DEFAULT true,
	"product_category_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "app_config" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	CONSTRAINT "app_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deposit_id" varchar(100) NOT NULL,
	"ref_id" varchar(100) NOT NULL,
	"user_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"amount_pay" integer NOT NULL,
	"amount_received" integer NOT NULL,
	"amount_fee" integer DEFAULT 0 NOT NULL,
	"phone_number" varchar(20),
	"email" varchar,
	"pay_code" varchar(100),
	"pay_url" varchar,
	"qr_code" varchar,
	"status" "deposit_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"expired_at" timestamp with time zone NOT NULL,
	CONSTRAINT "deposits_deposit_id_unique" UNIQUE("deposit_id")
);
--> statement-breakpoint
CREATE TABLE "file_manager" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar NOT NULL,
	"name" varchar NOT NULL,
	"mime_type" varchar NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_grouping_to_product_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_grouping_id" uuid,
	"product_category_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_groupings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"image_url" varchar NOT NULL,
	"redirect_url" varchar,
	"platform" "app_platform" DEFAULT 'web' NOT NULL,
	"type" "product_grouping_type" DEFAULT 'modal' NOT NULL,
	"menu_type" "product_grouping_menu_type" DEFAULT 'fast_menu' NOT NULL,
	"is_available" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"label" varchar,
	"order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "input_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"title" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"placeholder" varchar(100),
	"type" "input_field_type" DEFAULT 'text',
	"options" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "input_on_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input_field_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offer_on_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
	"discount_total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offer_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offer_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offer_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"sub_name" varchar(100),
	"image_url" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"code" varchar(50) NOT NULL,
	"quota" integer DEFAULT 0 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"usage_limit" integer DEFAULT 0 NOT NULL,
	"type" "offer_type" DEFAULT 'voucher' NOT NULL,
	"discount_static" integer DEFAULT 0 NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"discount_maximum" integer DEFAULT 0 NOT NULL,
	"min_amount" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_available" boolean DEFAULT false NOT NULL,
	"is_need_redeem" boolean DEFAULT false NOT NULL,
	"is_new_user" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"label" varchar(20),
	"is_all_users" boolean DEFAULT false NOT NULL,
	"is_allow_guest" boolean DEFAULT false NOT NULL,
	"is_all_payment_methods" boolean DEFAULT false NOT NULL,
	"is_all_products" boolean DEFAULT false NOT NULL,
	"is_unlimited_date" boolean DEFAULT false NOT NULL,
	"is_unlimited_quota" boolean DEFAULT false NOT NULL,
	"is_combinable_with_voucher" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "offers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"user_id" uuid NOT NULL,
	"product_snapshot_id" uuid NOT NULL,
	"payment_snapshot_id" uuid NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"cost_price" integer DEFAULT 0 NOT NULL,
	"discount_price" integer DEFAULT 0 NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"total_price" integer NOT NULL,
	"profit" integer DEFAULT 0 NOT NULL,
	"sn_number" varchar(150) NOT NULL,
	"notes" varchar,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"order_status" "order_status" DEFAULT 'none' NOT NULL,
	"refund_status" "refund_status" DEFAULT 'none' NOT NULL,
	"customer_input" varchar,
	"customer_email" varchar(150),
	"customer_phone" varchar(50),
	"customer_ip" varchar(50),
	"customer_ua" varchar(500),
	"voucher_code" varchar(100),
	"raw_response" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "payment_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"payment_method_category_id" uuid NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"fee_static" integer DEFAULT 0 NOT NULL,
	"fee_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"fee_type" "payment_method_fee_type" DEFAULT 'merchant',
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"label" varchar(20),
	"provider_name" "payment_method_provider" DEFAULT 'tripay',
	"provider_code" varchar(50) NOT NULL,
	"min_amount" integer DEFAULT 0 NOT NULL,
	"max_amount" integer DEFAULT 0 NOT NULL,
	"type" "payment_method_type" DEFAULT 'bank_transfer',
	"is_need_phone_number" boolean DEFAULT false NOT NULL,
	"is_need_email" boolean DEFAULT false NOT NULL,
	"allow_access" text[] DEFAULT '{"order"}',
	"expired_in" integer DEFAULT 0 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"instruction" text DEFAULT '' NOT NULL,
	"cut_off_start" time with time zone,
	"cut_off_end" time with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"name" varchar(100) NOT NULL,
	"sub_name" varchar(100),
	"description" text NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"banner_url" varchar(255) NOT NULL,
	"publisher" varchar(100) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"label" varchar(50),
	"delivery_type" varchar(50) NOT NULL,
	"is_seo_enabled" boolean DEFAULT false NOT NULL,
	"seo_title" varchar(100),
	"seo_description" varchar(255),
	"seo_image" varchar(255),
	"type" "product_category_type" DEFAULT 'game',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_sub_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"sub_name" varchar(100),
	"description" text,
	"image_url" varchar(255) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"label" varchar(50),
	"product_category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_sub_category_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"sub_name" varchar(100),
	"description" varchar(100),
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"label" varchar(25),
	"label_image" varchar(255),
	"image_url" varchar(255) NOT NULL,
	"sku_code" varchar(15) NOT NULL,
	"price" integer NOT NULL,
	"profit_static" integer DEFAULT 0 NOT NULL,
	"profit_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"provider_code" varchar(50) NOT NULL,
	"provider_name" "product_provider" DEFAULT 'atlantich2h',
	"provider_price" integer NOT NULL,
	"provider_max_price" integer NOT NULL,
	"provider_input_separator" varchar(3) DEFAULT '' NOT NULL,
	"notes" text,
	"billing_type" "product_billing_type" DEFAULT 'prepaid',
	"fullfillment_type" "product_fullfillment_type" DEFAULT 'automatic_direct',
	"cut_off_start" time with time zone,
	"cut_off_end" time with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_token" varchar(255),
	"login_type" "user_registered_type" DEFAULT 'local' NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token" text NOT NULL,
	"refresh_token_expires_at" timestamp with time zone,
	"user_agent" text NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"is_from" "login_is_from" DEFAULT 'web',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"payment_method_id" uuid,
	"type" "payment_method_type" DEFAULT 'bank_transfer' NOT NULL,
	"provider_ref_id" varchar NOT NULL,
	"fee_static" integer DEFAULT 0 NOT NULL,
	"fee_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"fee_type" "payment_method_fee_type" DEFAULT 'merchant',
	"provider_code" varchar(50) NOT NULL,
	"provider_name" "payment_method_provider" DEFAULT 'tripay' NOT NULL,
	"allow_access" text[] DEFAULT '{"order"}',
	"phone_number" varchar(20),
	"email" varchar,
	"pay_code" varchar(100),
	"pay_url" varchar,
	"qr_code" varchar,
	"expired_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"provider_ref_id" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"category_name" varchar(100) DEFAULT '',
	"sub_category_name" varchar(100) DEFAULT '',
	"sku_code" varchar(15) NOT NULL,
	"price" integer NOT NULL,
	"profit_static" integer DEFAULT 0 NOT NULL,
	"profit_percentage" numeric(5, 2) DEFAULT 0 NOT NULL,
	"provider_code" varchar(50) NOT NULL,
	"provider_name" "product_provider" DEFAULT 'atlantich2h',
	"provider_price" integer NOT NULL,
	"provider_max_price" integer NOT NULL,
	"provider_input_separator" varchar(3) DEFAULT '' NOT NULL,
	"notes" text,
	"billing_type" "product_billing_type" DEFAULT 'prepaid',
	"fullfillment_type" "product_fullfillment_type" DEFAULT 'automatic_direct',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oauth_id" varchar,
	"image_url" varchar,
	"registered_type" "user_registered_type" DEFAULT 'local' NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_article_category_id_article_categories_id_fk" FOREIGN KEY ("article_category_id") REFERENCES "public"."article_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_category_on_articles" ADD CONSTRAINT "product_category_on_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_category_on_articles" ADD CONSTRAINT "product_category_on_articles_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "balance_mutations" ADD CONSTRAINT "balance_mutations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_grouping_to_product_categories" ADD CONSTRAINT "product_grouping_to_product_categories_product_grouping_id_product_groupings_id_fk" FOREIGN KEY ("product_grouping_id") REFERENCES "public"."product_groupings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_grouping_to_product_categories" ADD CONSTRAINT "product_grouping_to_product_categories_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "input_on_category" ADD CONSTRAINT "input_on_category_input_field_id_input_fields_id_fk" FOREIGN KEY ("input_field_id") REFERENCES "public"."input_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "input_on_category" ADD CONSTRAINT "input_on_category_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_on_orders" ADD CONSTRAINT "offer_on_orders_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_on_orders" ADD CONSTRAINT "offer_on_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_on_orders" ADD CONSTRAINT "offer_on_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_payment_methods" ADD CONSTRAINT "offer_payment_methods_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_payment_methods" ADD CONSTRAINT "offer_payment_methods_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_users" ADD CONSTRAINT "offer_users_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_users" ADD CONSTRAINT "offer_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_products" ADD CONSTRAINT "offer_products_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_products" ADD CONSTRAINT "offer_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_snapshot_id_product_snapshots_id_fk" FOREIGN KEY ("product_snapshot_id") REFERENCES "public"."product_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_snapshot_id_payment_snapshots_id_fk" FOREIGN KEY ("payment_snapshot_id") REFERENCES "public"."payment_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_payment_method_category_id_payment_categories_id_fk" FOREIGN KEY ("payment_method_category_id") REFERENCES "public"."payment_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sub_categories" ADD CONSTRAINT "product_sub_categories_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_sub_category_id_product_sub_categories_id_fk" FOREIGN KEY ("product_sub_category_id") REFERENCES "public"."product_sub_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_snapshots" ADD CONSTRAINT "payment_snapshots_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_snapshots" ADD CONSTRAINT "product_snapshots_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "app_config_key_idx" ON "app_config" USING btree ("key");--> statement-breakpoint
CREATE INDEX "deposits_deposit_id_index" ON "deposits" USING btree ("deposit_id");--> statement-breakpoint
CREATE INDEX "orders_order_id_index" ON "orders" USING btree ("order_id");