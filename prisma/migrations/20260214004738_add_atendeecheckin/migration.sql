-- CreateTable
CREATE TABLE "atendee_check_in_codes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendee_check_in_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atendee_check_in_codes_expiresAt_idx" ON "atendee_check_in_codes"("expiresAt");
