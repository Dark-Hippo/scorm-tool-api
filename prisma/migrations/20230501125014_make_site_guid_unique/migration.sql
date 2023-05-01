/*
  Warnings:

  - A unique constraint covering the columns `[guid]` on the table `Site` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Site_guid_key" ON "Site"("guid");
