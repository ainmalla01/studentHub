-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('APPLICATION_DEVELOPMENT', 'PROBLEM_SOLVING', 'OTHER');

-- CreateEnum
CREATE TYPE "Faculty" AS ENUM ('BCA', 'BIT', 'CSIT', 'ALL');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'COMING_SOON', 'FINISHED');

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "startingDate" TIMESTAMP(3) NOT NULL,
    "endingDate" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL,
    "faculty" "Faculty" NOT NULL DEFAULT 'ALL',
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "studentId" INTEGER,
    "collegeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startingDate_idx" ON "Event"("startingDate");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;
