-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContractorComplianceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT,
    "contractorId" TEXT NOT NULL,
    "hoaId" TEXT NOT NULL,
    "marketplaceJobId" TEXT,
    "complianceEventId" TEXT,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContractorComplianceRecord_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "MarketplaceTransaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContractorComplianceRecord_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractorComplianceRecord_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractorComplianceRecord_marketplaceJobId_fkey" FOREIGN KEY ("marketplaceJobId") REFERENCES "MarketplaceJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ContractorComplianceRecord" ("completedAt", "complianceEventId", "contractorId", "createdAt", "hoaId", "id", "marketplaceJobId", "status", "summary", "transactionId") SELECT "completedAt", "complianceEventId", "contractorId", "createdAt", "hoaId", "id", "marketplaceJobId", "status", "summary", "transactionId" FROM "ContractorComplianceRecord";
DROP TABLE "ContractorComplianceRecord";
ALTER TABLE "new_ContractorComplianceRecord" RENAME TO "ContractorComplianceRecord";
CREATE INDEX "ContractorComplianceRecord_hoaId_contractorId_idx" ON "ContractorComplianceRecord"("hoaId", "contractorId");
CREATE INDEX "ContractorComplianceRecord_marketplaceJobId_idx" ON "ContractorComplianceRecord"("marketplaceJobId");
CREATE UNIQUE INDEX "ContractorComplianceRecord_transactionId_key" ON "ContractorComplianceRecord"("transactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
