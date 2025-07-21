ALTER TABLE "balance_mutations" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "balance_mutations" ADD COLUMN "balance_before" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "balance_mutations" ADD COLUMN "balance_after" integer NOT NULL;