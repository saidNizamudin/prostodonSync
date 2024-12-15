/*
  Warnings:

  - The values [CANCELLED] on the enum `ScheduleStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScheduleStatusEnum_new" AS ENUM ('ACTIVE', 'CLOSED');
ALTER TABLE "Schedule" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Schedule" ALTER COLUMN "status" TYPE "ScheduleStatusEnum_new" USING ("status"::text::"ScheduleStatusEnum_new");
ALTER TYPE "ScheduleStatusEnum" RENAME TO "ScheduleStatusEnum_old";
ALTER TYPE "ScheduleStatusEnum_new" RENAME TO "ScheduleStatusEnum";
DROP TYPE "ScheduleStatusEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
