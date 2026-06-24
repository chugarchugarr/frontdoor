-- CreateTable
CREATE TABLE "ContractorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "waitlistId" TEXT,
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "trades" TEXT NOT NULL,
    "serviceZips" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "insuranceStatus" TEXT NOT NULL DEFAULT 'unknown',
    "screeningStatus" TEXT NOT NULL DEFAULT 'waitlisted',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractorProfile_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "ContractorWaitlist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractorCommunityAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractorId" TEXT NOT NULL,
    "hoaId" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "accessType" TEXT NOT NULL DEFAULT 'founding_slot',
    "activeFrom" DATETIME,
    "activeUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractorCommunityAccess_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractorCommunityAccess_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractorSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "seatsTaken" INTEGER NOT NULL DEFAULT 0,
    "priceCents" INTEGER NOT NULL DEFAULT 9900,
    "status" TEXT NOT NULL DEFAULT 'open',
    "scarcityLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractorSlot_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketplaceJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "homeownerId" TEXT,
    "workOrderId" TEXT,
    "arcRequestId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "estimatedValueCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketplaceJob_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractorQuote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketplaceJobId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractorQuote_marketplaceJobId_fkey" FOREIGN KEY ("marketplaceJobId") REFERENCES "MarketplaceJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractorQuote_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketplaceTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "quoteId" TEXT,
    "hoaId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "grossAmountCents" INTEGER NOT NULL,
    "gatepassFeeCents" INTEGER NOT NULL,
    "hoaShareCents" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recorded',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketplaceTransaction_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MarketplaceJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketplaceTransaction_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "ContractorQuote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MarketplaceTransaction_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketplaceTransaction_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityRevenueShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'transaction_share',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedTo" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityRevenueShare_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityRevenueShare_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "MarketplaceTransaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractorComplianceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractorId" TEXT NOT NULL,
    "hoaId" TEXT NOT NULL,
    "marketplaceJobId" TEXT,
    "complianceEventId" TEXT,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContractorComplianceRecord_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractorComplianceRecord_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractorComplianceRecord_marketplaceJobId_fkey" FOREIGN KEY ("marketplaceJobId") REFERENCES "MarketplaceJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractorProfile_waitlistId_key" ON "ContractorProfile"("waitlistId");

-- CreateIndex
CREATE INDEX "ContractorProfile_screeningStatus_idx" ON "ContractorProfile"("screeningStatus");

-- CreateIndex
CREATE INDEX "ContractorProfile_email_idx" ON "ContractorProfile"("email");

-- CreateIndex
CREATE INDEX "ContractorCommunityAccess_hoaId_status_idx" ON "ContractorCommunityAccess"("hoaId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorCommunityAccess_contractorId_hoaId_trade_key" ON "ContractorCommunityAccess"("contractorId", "hoaId", "trade");

-- CreateIndex
CREATE INDEX "ContractorSlot_hoaId_trade_idx" ON "ContractorSlot"("hoaId", "trade");

-- CreateIndex
CREATE INDEX "ContractorSlot_status_idx" ON "ContractorSlot"("status");

-- CreateIndex
CREATE INDEX "MarketplaceJob_hoaId_status_idx" ON "MarketplaceJob"("hoaId", "status");

-- CreateIndex
CREATE INDEX "MarketplaceJob_workOrderId_idx" ON "MarketplaceJob"("workOrderId");

-- CreateIndex
CREATE INDEX "MarketplaceJob_arcRequestId_idx" ON "MarketplaceJob"("arcRequestId");

-- CreateIndex
CREATE INDEX "ContractorQuote_marketplaceJobId_status_idx" ON "ContractorQuote"("marketplaceJobId", "status");

-- CreateIndex
CREATE INDEX "ContractorQuote_contractorId_idx" ON "ContractorQuote"("contractorId");

-- CreateIndex
CREATE INDEX "MarketplaceTransaction_hoaId_status_idx" ON "MarketplaceTransaction"("hoaId", "status");

-- CreateIndex
CREATE INDEX "MarketplaceTransaction_contractorId_idx" ON "MarketplaceTransaction"("contractorId");

-- CreateIndex
CREATE INDEX "CommunityRevenueShare_hoaId_status_idx" ON "CommunityRevenueShare"("hoaId", "status");

-- CreateIndex
CREATE INDEX "ContractorComplianceRecord_hoaId_contractorId_idx" ON "ContractorComplianceRecord"("hoaId", "contractorId");

-- CreateIndex
CREATE INDEX "ContractorComplianceRecord_marketplaceJobId_idx" ON "ContractorComplianceRecord"("marketplaceJobId");
