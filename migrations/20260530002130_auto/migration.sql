-- CreateTable
CREATE TABLE "TransitionCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "currentPmc" TEXT NOT NULL,
    "priorPmc" TEXT,
    "sourceSignal" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "signalSummary" TEXT NOT NULL,
    "complaintThemes" TEXT NOT NULL,
    "contractStatus" TEXT NOT NULL DEFAULT 'unknown',
    "renewalDate" DATETIME,
    "noticeWindowDays" INTEGER,
    "terminationFeeCents" INTEGER,
    "buyoutOfferedCents" INTEGER,
    "boardFear" TEXT,
    "decidingProof" TEXT,
    "counterMove" TEXT,
    "nextStep" TEXT,
    "status" TEXT NOT NULL DEFAULT 'identified',
    "transitionScore" INTEGER NOT NULL DEFAULT 0,
    "replicabilityScore" INTEGER NOT NULL DEFAULT 0,
    "dataCompleteness" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransitionCase_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardStakeholder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "transitionCaseId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "contact" TEXT,
    "stance" TEXT NOT NULL DEFAULT 'unknown',
    "primaryConcern" TEXT,
    "persuasionAngle" TEXT,
    "lastInteractionAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoardStakeholder_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BoardStakeholder_transitionCaseId_fkey" FOREIGN KEY ("transitionCaseId") REFERENCES "TransitionCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MoatSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "transitionCaseId" TEXT,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "isPubliclyReplicable" BOOLEAN NOT NULL DEFAULT false,
    "moatWeight" INTEGER NOT NULL DEFAULT 1,
    "capturedBy" TEXT NOT NULL DEFAULT 'GatePass',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoatSignal_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MoatSignal_transitionCaseId_fkey" FOREIGN KEY ("transitionCaseId") REFERENCES "TransitionCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TransitionCase_hoaId_status_idx" ON "TransitionCase"("hoaId", "status");

-- CreateIndex
CREATE INDEX "TransitionCase_currentPmc_idx" ON "TransitionCase"("currentPmc");

-- CreateIndex
CREATE INDEX "TransitionCase_sourceSignal_idx" ON "TransitionCase"("sourceSignal");

-- CreateIndex
CREATE INDEX "BoardStakeholder_hoaId_role_idx" ON "BoardStakeholder"("hoaId", "role");

-- CreateIndex
CREATE INDEX "BoardStakeholder_transitionCaseId_stance_idx" ON "BoardStakeholder"("transitionCaseId", "stance");

-- CreateIndex
CREATE INDEX "MoatSignal_hoaId_category_idx" ON "MoatSignal"("hoaId", "category");

-- CreateIndex
CREATE INDEX "MoatSignal_transitionCaseId_category_idx" ON "MoatSignal"("transitionCaseId", "category");

-- CreateIndex
CREATE INDEX "MoatSignal_isPubliclyReplicable_moatWeight_idx" ON "MoatSignal"("isPubliclyReplicable", "moatWeight");
