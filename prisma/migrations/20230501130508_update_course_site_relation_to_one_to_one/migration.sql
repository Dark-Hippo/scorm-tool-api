/*
  Warnings:

  - A unique constraint covering the columns `[courseId]` on the table `Site` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Site_courseId_key" ON "Site"("courseId");
