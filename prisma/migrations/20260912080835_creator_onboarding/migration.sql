-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessCountry" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "hasBusiness" BOOLEAN,
ADD COLUMN     "industries" TEXT[],
ADD COLUMN     "invoiceMandateAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "legalAddress" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "linkedinImportedAt" TIMESTAMP(3),
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "profileDataSource" TEXT NOT NULL DEFAULT 'demo',
ADD COLUMN     "taxDeclarationAcceptedAt" TIMESTAMP(3);
