CREATE TYPE "public"."article_type" AS ENUM('article', 'page');--> statement-breakpoint
ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "pages" CASCADE;--> statement-breakpoint
ALTER TABLE "article_categories" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "article_category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "type" "article_type" DEFAULT 'article' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_title" varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_description" varchar(500);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "published_at" timestamp with time zone;