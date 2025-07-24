ALTER TABLE "product_snapshots" ADD COLUMN "category_name" varchar(100) DEFAULT '';--> statement-breakpoint
ALTER TABLE "product_snapshots" ADD COLUMN "sub_category_name" varchar(100) DEFAULT '';--> statement-breakpoint
ALTER TABLE "product_snapshots" DROP COLUMN "sub_name";