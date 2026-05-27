-- CreateTable
CREATE TABLE "beta_applications" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "team_size" TEXT,
    "review_status" TEXT NOT NULL DEFAULT 'pending',
    "slot_status" TEXT NOT NULL DEFAULT 'unassigned',
    "source" TEXT NOT NULL DEFAULT 'landing_page',
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "beta_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "beta_applications_public_id_key" ON "beta_applications"("public_id");

-- CreateIndex
CREATE INDEX "idx_beta_applications_submitted_at" ON "beta_applications"("submitted_at");

-- CreateIndex
CREATE INDEX "idx_beta_applications_company_name" ON "beta_applications"("company_name");

-- CreateIndex
CREATE INDEX "idx_beta_applications_contact" ON "beta_applications"("contact");

-- CreateIndex
CREATE INDEX "idx_beta_applications_review_status" ON "beta_applications"("review_status");

-- CreateIndex
CREATE INDEX "idx_beta_applications_source" ON "beta_applications"("source");
