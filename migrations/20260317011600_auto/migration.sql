-- CreateTable
CREATE TABLE "HOA" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContractorWaitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Austin',
    "state" TEXT NOT NULL DEFAULT 'TX',
    "stripeSessionId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "position" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
