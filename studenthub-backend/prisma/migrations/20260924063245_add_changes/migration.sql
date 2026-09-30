/*
  Warnings:

  - Added the required column `start_date` to the `challenges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "about" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile" TEXT NOT NULL,
ADD COLUMN     "university" TEXT,
ALTER COLUMN "student_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "challenge_participations" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_participations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_participations_student_id_idx" ON "challenge_participations"("student_id");

-- CreateIndex
CREATE INDEX "challenge_participations_challenge_id_idx" ON "challenge_participations"("challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participations_student_id_challenge_id_key" ON "challenge_participations"("student_id", "challenge_id");

-- CreateIndex
CREATE INDEX "challenges_start_date_idx" ON "challenges"("start_date");

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
