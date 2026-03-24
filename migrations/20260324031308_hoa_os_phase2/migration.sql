-- CreateTable
CREATE TABLE "Homeowner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "unit" TEXT,
    "role" TEXT NOT NULL DEFAULT 'resident',
    "stripeCustomerId" TEXT,
    "moveInDate" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Homeowner_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeownerPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeownerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HomeownerPermission_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DuesAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeownerId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "monthlyDueCents" INTEGER NOT NULL DEFAULT 0,
    "autopayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePaymentMethodId" TEXT,
    "lastChargedAt" DATETIME,
    "nextDueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DuesAccount_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "duesAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_duesAccountId_fkey" FOREIGN KEY ("duesAccountId") REFERENCES "DuesAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budgetedCents" INTEGER NOT NULL,
    "actualCents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Budget_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "homeownerId" TEXT,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'minor',
    "status" TEXT NOT NULL DEFAULT 'open',
    "photoUrls" TEXT,
    "reportedBy" TEXT,
    "noticeCount" INTEGER NOT NULL DEFAULT 0,
    "latestNoticeAt" DATETIME,
    "nextNoticeAt" DATETIME,
    "fineCents" INTEGER,
    "resolvedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Violation_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Violation_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ViolationNotice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "violationId" TEXT NOT NULL,
    "noticeNumber" INTEGER NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentTo" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'email',
    "dueDate" DATETIME NOT NULL,
    "body" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" DATETIME,
    CONSTRAINT "ViolationNotice_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ARCRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedCost" INTEGER,
    "startDate" DATETIME,
    "documentUrls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "reviewDeadline" DATETIME NOT NULL,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "conditions" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ARCRequest_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ARCRequest_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'board',
    "scheduledAt" DATETIME NOT NULL,
    "location" TEXT,
    "virtualLink" TEXT,
    "agenda" TEXT,
    "minutes" TEXT,
    "quorumRequired" INTEGER,
    "quorumMet" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meeting_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "presenter" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgendaItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "meetingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'motion',
    "options" TEXT NOT NULL,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "requiresQuorum" BOOLEAN NOT NULL DEFAULT true,
    "quorumCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "opensAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" DATETIME NOT NULL,
    "resultSummary" TEXT,
    "certifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoteCast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voteId" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "castAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoteCast_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VoteCast_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "homeownerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "assignedAt" DATETIME,
    "estimatedCost" INTEGER,
    "actualCost" INTEGER,
    "photoUrls" TEXT,
    "completionNotes" TEXT,
    "boardApproved" BOOLEAN NOT NULL DEFAULT false,
    "boardApprovedAt" DATETIME,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkOrder_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "rules" TEXT,
    "depositCents" INTEGER DEFAULT 0,
    "openTime" TEXT DEFAULT '08:00',
    "closeTime" TEXT DEFAULT '22:00',
    "advanceBookingDays" INTEGER DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Amenity_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amenityId" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "guestCount" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "depositRefunded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sentEmail" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "authorName" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeownerId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'open',
    "referenceId" TEXT,
    "referenceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HOA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Austin',
    "state" TEXT NOT NULL DEFAULT 'TX',
    "zip" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "stripeSessionId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "amountCents" INTEGER,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "pricePerUnit" INTEGER NOT NULL DEFAULT 1000,
    "onboardedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_HOA" ("amountCents", "city", "community", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "name", "paid", "paidAt", "state", "stripeSessionId", "units", "zip") SELECT "amountCents", "city", "community", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "name", "paid", "paidAt", "state", "stripeSessionId", "units", "zip" FROM "HOA";
DROP TABLE "HOA";
ALTER TABLE "new_HOA" RENAME TO "HOA";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DuesAccount_homeownerId_key" ON "DuesAccount"("homeownerId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteCast_voteId_homeownerId_key" ON "VoteCast"("voteId", "homeownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_amenityId_date_startTime_key" ON "Reservation"("amenityId", "date", "startTime");
