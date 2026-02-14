/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `atendee_check_in_codes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `atendee_check_in_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "atendee_check_in_codes" ADD COLUMN     "eventId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "atendee_check_in_codes_eventId_key" ON "atendee_check_in_codes"("eventId");

-- AddForeignKey
ALTER TABLE "atendee_check_in_codes" ADD CONSTRAINT "atendee_check_in_codes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
