-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('FORO', 'ACTO', 'TALLER', 'CONFERENCIA', 'CAPACITACION', 'OTRO');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'OTRO';
