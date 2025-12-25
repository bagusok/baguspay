CREATE TYPE "public"."banner_location" AS ENUM('home_top', 'home_middle', 'home_bottom', 'category_top', 'category_middle', 'category_bottom', 'product_top', 'product_middle', 'product_bottom');--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "banner_location" "banner_location" DEFAULT 'home_top' NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "icon_url" varchar(255);--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "tags1" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "tags2" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "is_special_feature" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "special_feature_key" varchar(50);--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "product_billing_type" "product_billing_type" DEFAULT 'prepaid';--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "product_fullfillment_type" "product_fullfillment_type" DEFAULT 'automatic_direct';