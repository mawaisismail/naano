-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountHolder" TEXT,
ADD COLUMN     "bankIban" TEXT,
ADD COLUMN     "payoutMethod" TEXT NOT NULL DEFAULT 'stripe',
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredAt" TIMESTAMP(3),
ADD COLUMN     "referredById" TEXT,
ADD COLUMN     "stripeAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
