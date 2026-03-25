-- AlterTable
ALTER TABLE "ARCRequest" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "ARCRequest" ADD COLUMN "aiAnalyzedAt" DATETIME;

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "Announcement" ADD COLUMN "aiAnalyzedAt" DATETIME;

-- AlterTable
ALTER TABLE "ContractorWaitlist" ADD COLUMN "aiScreenedAt" DATETIME;
ALTER TABLE "ContractorWaitlist" ADD COLUMN "aiScreeningResult" TEXT;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "Meeting" ADD COLUMN "aiAnalyzedAt" DATETIME;

-- AlterTable
ALTER TABLE "Violation" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "Violation" ADD COLUMN "aiAnalyzedAt" DATETIME;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "Vote" ADD COLUMN "aiAnalyzedAt" DATETIME;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "WorkOrder" ADD COLUMN "aiAnalyzedAt" DATETIME;
ALTER TABLE "WorkOrder" ADD COLUMN "area" TEXT;
ALTER TABLE "WorkOrder" ADD COLUMN "notes" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "presenter" TEXT,
    "duration" INTEGER,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgendaItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AgendaItem" ("createdAt", "description", "duration", "id", "meetingId", "notes", "order", "presenter", "status", "title") SELECT "createdAt", "description", "duration", "id", "meetingId", "notes", "order", "presenter", "status", "title" FROM "AgendaItem";
DROP TABLE "AgendaItem";
ALTER TABLE "new_AgendaItem" RENAME TO "AgendaItem";
CREATE TABLE "new_DuesAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeownerId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "monthlyDueCents" INTEGER NOT NULL DEFAULT 0,
    "overdueMonths" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentAt" DATETIME,
    "autopayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePaymentMethodId" TEXT,
    "lastChargedAt" DATETIME,
    "nextDueDate" DATETIME,
    "aiAnalysis" TEXT,
    "aiAnalyzedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DuesAccount_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DuesAccount" ("autopayEnabled", "balanceCents", "createdAt", "homeownerId", "id", "lastChargedAt", "monthlyDueCents", "nextDueDate", "stripePaymentMethodId", "updatedAt") SELECT "autopayEnabled", "balanceCents", "createdAt", "homeownerId", "id", "lastChargedAt", "monthlyDueCents", "nextDueDate", "stripePaymentMethodId", "updatedAt" FROM "DuesAccount";
DROP TABLE "DuesAccount";
ALTER TABLE "new_DuesAccount" RENAME TO "DuesAccount";
CREATE UNIQUE INDEX "DuesAccount_homeownerId_key" ON "DuesAccount"("homeownerId");
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amenityId" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "partySize" INTEGER,
    "guestCount" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "depositRefunded" BOOLEAN NOT NULL DEFAULT false,
    "aiAnalysis" TEXT,
    "aiAnalyzedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("amenityId", "createdAt", "date", "depositPaid", "depositRefunded", "endTime", "guestCount", "homeownerId", "id", "notes", "startTime", "status", "updatedAt") SELECT "amenityId", "createdAt", "date", "depositPaid", "depositRefunded", "endTime", "guestCount", "homeownerId", "id", "notes", "startTime", "status", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE UNIQUE INDEX "Reservation_amenityId_date_startTime_key" ON "Reservation"("amenityId", "date", "startTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
