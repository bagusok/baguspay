ALTER TABLE "banners" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "app_config" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "product_grouping_to_product_categories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();