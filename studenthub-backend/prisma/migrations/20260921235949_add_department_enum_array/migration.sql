-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ALL', 'BCA', 'CSIT', 'BIT');

-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "departments" "Department"[];
