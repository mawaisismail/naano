-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "companyName" TEXT,
    "creatorSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "providerAccountId" TEXT,
    "heardAbout" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "headline" TEXT,
    "bio" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "flag" TEXT,
    "verticals" TEXT[],
    "icp" TEXT[],
    "avatarUrl" TEXT,
    "followers" INTEGER,
    "medianViews" INTEGER,
    "postCost" INTEGER,
    "reactionsPerPost" INTEGER,
    "commentsPerPost" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "keyMessages" TEXT NOT NULL,
    "guidelines" TEXT NOT NULL,
    "landingUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorSlug" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "trackingCode" TEXT NOT NULL,
    "postUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "referer" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_authProvider_providerAccountId_key" ON "User"("authProvider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Campaign_brandId_idx" ON "Campaign"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_trackingCode_key" ON "Deal"("trackingCode");

-- CreateIndex
CREATE INDEX "Deal_campaignId_idx" ON "Deal"("campaignId");

-- CreateIndex
CREATE INDEX "Deal_creatorSlug_idx" ON "Deal"("creatorSlug");

-- CreateIndex
CREATE INDEX "Click_dealId_idx" ON "Click"("dealId");

-- CreateIndex
CREATE INDEX "Click_trackingCode_idx" ON "Click"("trackingCode");

-- CreateIndex
CREATE INDEX "Click_dealId_ipHash_createdAt_idx" ON "Click"("dealId", "ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetCode_email_idx" ON "PasswordResetCode"("email");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
