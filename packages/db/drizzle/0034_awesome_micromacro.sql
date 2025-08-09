CREATE TYPE "public"."app_platform" AS ENUM('web', 'app');--> statement-breakpoint
CREATE TYPE "public"."product_grouping_menu_type" AS ENUM('home_menu', 'fast_menu');--> statement-breakpoint
CREATE TYPE "public"."product_grouping_type" AS ENUM('redirect', 'modal');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"image" varchar NOT NULL,
	"is_available" text DEFAULT 'true',
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
CREATE TABLE "product_grouping_to_product_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_grouping_id" uuid,
	"product_category_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_groupings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"image_url" varchar NOT NULL,
	"redirect_url" varchar,
	"platform" "app_platform" DEFAULT 'web' NOT NULL,
	"type" "product_grouping_type" DEFAULT 'modal' NOT NULL,
	"menu_type" "product_grouping_menu_type" DEFAULT 'fast_menu' NOT NULL,
	"is_available" text DEFAULT 'true',
	"is_featured" text DEFAULT 'false',
	"label" varchar,
	"order" varchar DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'guest');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_grouping_to_product_categories" ADD CONSTRAINT "product_grouping_to_product_categories_product_grouping_id_product_groupings_id_fk" FOREIGN KEY ("product_grouping_id") REFERENCES "public"."product_groupings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_grouping_to_product_categories" ADD CONSTRAINT "product_grouping_to_product_categories_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "app_config_key_idx" ON "app_config" USING btree ("key");