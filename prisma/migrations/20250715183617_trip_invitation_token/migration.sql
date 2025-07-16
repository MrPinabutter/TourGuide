-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "inviteMode" "MemberRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "inviteTokenExpirationDate" TIMESTAMP(3);
