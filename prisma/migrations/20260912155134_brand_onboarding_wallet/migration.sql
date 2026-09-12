-- AlterTable
ALTER TABLE "User" ADD COLUMN     "brandDataSource" TEXT NOT NULL DEFAULT 'demo',
ADD COLUMN     "brandOnboardedAt" TIMESTAMP(3),
ADD COLUMN     "icps" TEXT[],
ADD COLUMN     "valueProp" TEXT,
ADD COLUMN     "walletBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "WalletEntry" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletEntry_brandId_idx" ON "WalletEntry"("brandId");

-- AddForeignKey
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

