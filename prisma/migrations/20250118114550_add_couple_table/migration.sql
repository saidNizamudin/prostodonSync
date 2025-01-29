-- AlterTable
ALTER TABLE "People" ADD COLUMN     "coupleId" TEXT;

-- CreateTable
CREATE TABLE "Couple" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "People" ADD CONSTRAINT "People_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;
