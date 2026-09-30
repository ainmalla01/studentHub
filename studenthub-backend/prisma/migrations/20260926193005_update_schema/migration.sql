/*
  Warnings:

  - You are about to drop the column `level` on the `student_skills` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `student_skills` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_skills" DROP COLUMN "level",
DROP COLUMN "score";
