/*
  Warnings:

  - You are about to drop the column `rubric` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `code_quality` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `documentation` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `functionality` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `problem_solving` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `student_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `student_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "challenges" DROP COLUMN "rubric";

-- AlterTable
ALTER TABLE "evaluations" DROP COLUMN "code_quality",
DROP COLUMN "documentation",
DROP COLUMN "functionality",
DROP COLUMN "problem_solving";

-- AlterTable
ALTER TABLE "student_submissions" DROP COLUMN "feedback",
DROP COLUMN "score";

-- CreateTable
CREATE TABLE "rubrics" (
    "id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_scores" (
    "id" UUID NOT NULL,
    "evaluation_id" UUID NOT NULL,
    "rubric_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,

    CONSTRAINT "rubric_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rubrics_challenge_id_idx" ON "rubrics"("challenge_id");

-- CreateIndex
CREATE INDEX "rubric_scores_rubric_id_idx" ON "rubric_scores"("rubric_id");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_scores_evaluation_id_rubric_id_key" ON "rubric_scores"("evaluation_id", "rubric_id");

-- AddForeignKey
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_scores" ADD CONSTRAINT "rubric_scores_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_scores" ADD CONSTRAINT "rubric_scores_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
