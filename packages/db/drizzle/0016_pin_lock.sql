ALTER TABLE "users"
  ADD COLUMN "pin_hash" varchar(255),
  ADD COLUMN "pin_attempts" integer NOT NULL DEFAULT 0,
  ADD COLUMN "pin_locked_until" timestamp with time zone,
  ADD COLUMN "pin_set_at" timestamp with time zone;
