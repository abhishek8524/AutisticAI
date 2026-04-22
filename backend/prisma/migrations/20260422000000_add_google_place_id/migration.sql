-- AlterTable
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Location_googlePlaceId_key" ON "Location"("googlePlaceId");
