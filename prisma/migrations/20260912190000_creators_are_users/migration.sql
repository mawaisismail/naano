-- Creators become real users, and a Deal points at one.
--
-- Existing deals reference seeded creators that were never rows, so there is
-- no user to attach them to and no honest way to invent one. They are removed
-- along with their clicks and messages. That data was demo content; the
-- constraint being added is what stops it existing again.
DELETE FROM "Deal";

ALTER TABLE "Deal" DROP COLUMN "creatorName";
ALTER TABLE "Deal" DROP COLUMN "creatorSlug";
ALTER TABLE "Deal" ADD COLUMN "initiatedBy" TEXT NOT NULL DEFAULT 'creator';

DROP INDEX IF EXISTS "Deal_creatorSlug_idx";
CREATE INDEX "Deal_creatorId_idx" ON "Deal"("creatorId");
CREATE UNIQUE INDEX "Deal_campaignId_creatorId_key" ON "Deal"("campaignId", "creatorId");

ALTER TABLE "Deal"
  ADD CONSTRAINT "Deal_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
