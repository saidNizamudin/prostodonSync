-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "People" DROP CONSTRAINT "People_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "People" ADD CONSTRAINT "People_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
