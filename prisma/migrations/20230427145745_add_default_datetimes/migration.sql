-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "createdDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "createdDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedDate" SET DEFAULT CURRENT_TIMESTAMP;