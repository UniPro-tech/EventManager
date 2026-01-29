-- AlterTable
ALTER TABLE "event" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "endTime" TIME,
ADD COLUMN     "startTime" TIME,
ALTER COLUMN "date" SET DATA TYPE DATE;
