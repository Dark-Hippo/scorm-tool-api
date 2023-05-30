-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_courseId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "courseEntrypoint" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
