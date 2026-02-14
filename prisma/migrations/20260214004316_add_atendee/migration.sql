-- AlterTable
ALTER TABLE "event_attendee" ADD COLUMN     "isAtended" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "event_attendee_isAtended_idx" ON "event_attendee"("isAtended");
