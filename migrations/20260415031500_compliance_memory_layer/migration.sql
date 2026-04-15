-- GatePass Compliance Memory Layer
-- Adds ComplianceEvent (immutable audit ledger) and ComplianceExport (export audit trail)
-- Strategic purpose: L3 Trust → L8 Memory moat build

CREATE TABLE "ComplianceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "summary" TEXT NOT NULL,
    "detail" TEXT,
    "dataSnapshot" TEXT,
    "legalFlag" BOOLEAN NOT NULL DEFAULT false,
    "legalCategory" TEXT,
    "documentHash" TEXT,
    "documentUrl" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceEvent_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ComplianceExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "exportJson" TEXT NOT NULL,
    "purpose" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ComplianceEvent_hoaId_createdAt_idx" ON "ComplianceEvent"("hoaId", "createdAt");
CREATE INDEX "ComplianceEvent_hoaId_module_idx" ON "ComplianceEvent"("hoaId", "module");
CREATE INDEX "ComplianceEvent_hoaId_eventType_idx" ON "ComplianceEvent"("hoaId", "eventType");
CREATE INDEX "ComplianceEvent_hoaId_legalFlag_idx" ON "ComplianceEvent"("hoaId", "legalFlag");
CREATE INDEX "ComplianceEvent_targetId_idx" ON "ComplianceEvent"("targetId");
