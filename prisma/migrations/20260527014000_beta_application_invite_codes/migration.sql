CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP INDEX IF EXISTS "idx_beta_applications_submitted_at";
DROP INDEX IF EXISTS "idx_beta_applications_company_name";
DROP INDEX IF EXISTS "idx_beta_applications_contact";

ALTER TABLE "beta_applications"
  ADD COLUMN "occupation" TEXT,
  ADD COLUMN "work_background" TEXT,
  ADD COLUMN "use_case" TEXT,
  ADD COLUMN "invite_code" TEXT,
  ADD COLUMN "invite_code_valid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "invite_code_status" TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN "priority_level" TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN "priority_reason" TEXT,
  ADD COLUMN "reviewer_note" TEXT,
  ADD COLUMN "created_at" TIMESTAMPTZ(6),
  ADD COLUMN "updated_at" TIMESTAMPTZ(6);

UPDATE "beta_applications"
SET
  "occupation" = COALESCE(NULLIF("name", ''), 'legacy_applicant'),
  "work_background" = NULLIF("company_name", ''),
  "use_case" = COALESCE(NULLIF("team_size", ''), 'legacy_submission'),
  "invite_code_status" = 'none',
  "priority_level" = 'medium',
  "priority_reason" = CASE WHEN "source" = 'manual_api_verify' THEN 'legacy_manual_verify' ELSE NULL END,
  "created_at" = "submitted_at",
  "updated_at" = "submitted_at";

ALTER TABLE "beta_applications"
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" TYPE UUID USING gen_random_uuid(),
  ALTER COLUMN "occupation" SET NOT NULL,
  ALTER COLUMN "use_case" SET NOT NULL,
  ALTER COLUMN "review_status" SET DEFAULT 'new',
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER SEQUENCE IF EXISTS "beta_applications_id_seq" OWNED BY NONE;
DROP SEQUENCE IF EXISTS "beta_applications_id_seq";

ALTER TABLE "beta_applications"
  DROP COLUMN "name",
  DROP COLUMN "company_name",
  DROP COLUMN "team_size",
  DROP COLUMN "slot_status",
  DROP COLUMN "submitted_at";

CREATE TABLE "invite_codes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "max_uses" INTEGER,
  "used_count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ(6),
  "label" TEXT,
  "note" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_beta_applications_created_at" ON "beta_applications"("created_at");
CREATE INDEX "idx_beta_applications_occupation" ON "beta_applications"("occupation");
CREATE INDEX "idx_beta_applications_use_case" ON "beta_applications"("use_case");
CREATE INDEX "idx_beta_applications_invite_code" ON "beta_applications"("invite_code");
CREATE INDEX "idx_beta_applications_invite_code_valid" ON "beta_applications"("invite_code_valid");
CREATE INDEX "idx_beta_applications_invite_code_status" ON "beta_applications"("invite_code_status");
CREATE INDEX "idx_beta_applications_priority_level" ON "beta_applications"("priority_level");
CREATE INDEX IF NOT EXISTS "idx_beta_applications_contact" ON "beta_applications"("contact");

CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");
CREATE INDEX "idx_invite_codes_is_active" ON "invite_codes"("is_active");
CREATE INDEX "idx_invite_codes_expires_at" ON "invite_codes"("expires_at");
