-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "closed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "open" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
