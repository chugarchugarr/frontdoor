-- GatePass Marketplace Hardening
-- Adds webhook idempotency, marketplace settlement idempotency, and transaction-bound compliance memory.

ALTER TABLE "MarketplaceTransaction" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "MarketplaceTransaction" ADD COLUMN "settledAt" DATETIME;

CREATE UNIQUE INDEX "MarketplaceTransaction_idempotencyKey_key" ON "MarketplaceTransaction"("idempotencyKey");

ALTER TABLE "ContractorComplianceRecord" ADD COLUMN "transactionId" TEXT;
ALTER TABLE "ContractorComplianceRecord" ADD COLUMN "completedAt" DATETIME;

CREATE UNIQUE INDEX "ContractorComplianceRecord_transactionId_key" ON "ContractorComplianceRecord"("transactionId");

CREATE TABLE "ProcessedStripeEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
