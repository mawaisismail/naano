-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'linkedin',
ADD COLUMN     "countries" TEXT[],
ADD COLUMN     "industries" TEXT[],
ADD COLUMN     "postDeadline" TIMESTAMP(3);
