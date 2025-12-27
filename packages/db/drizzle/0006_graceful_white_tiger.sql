ALTER TABLE "inquiries" DROP CONSTRAINT "inquiries_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "offer_applied" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "inquiries" DROP COLUMN "product_id";