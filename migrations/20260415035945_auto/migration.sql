-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ComplianceExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "exportJson" TEXT NOT NULL,
    "purpose" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceExport_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ComplianceExport" ("createdAt", "dateRangeEnd", "dateRangeStart", "eventCount", "exportJson", "hoaId", "id", "purpose", "requestedBy") SELECT "createdAt", "dateRangeEnd", "dateRangeStart", "eventCount", "exportJson", "hoaId", "id", "purpose", "requestedBy" FROM "ComplianceExport";
DROP TABLE "ComplianceExport";
ALTER TABLE "new_ComplianceExport" RENAME TO "ComplianceExport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
