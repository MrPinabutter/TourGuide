-- CreateEnum
CREATE TYPE "UserVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "visibility" "UserVisibility" NOT NULL DEFAULT 'PUBLIC';
