-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_creatorId_fkey";

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "tripMemberId" INTEGER;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_tripMemberId_fkey" FOREIGN KEY ("tripMemberId") REFERENCES "TripMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
