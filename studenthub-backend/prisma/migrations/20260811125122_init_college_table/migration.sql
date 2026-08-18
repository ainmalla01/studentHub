/*
  Warnings:

  - You are about to drop the `colleges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `communities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `community_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_registrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COLLEGE');

-- DropForeignKey
ALTER TABLE "colleges" DROP CONSTRAINT "colleges_adminId_fkey";

-- DropForeignKey
ALTER TABLE "communities" DROP CONSTRAINT "communities_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "community_members" DROP CONSTRAINT "community_members_communityId_fkey";

-- DropForeignKey
ALTER TABLE "community_members" DROP CONSTRAINT "community_members_studentId_fkey";

-- DropForeignKey
ALTER TABLE "event_registrations" DROP CONSTRAINT "event_registrations_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_registrations" DROP CONSTRAINT "event_registrations_studentId_fkey";

-- DropForeignKey
ALTER TABLE "event_submissions" DROP CONSTRAINT "event_submissions_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_submissions" DROP CONSTRAINT "event_submissions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "notices" DROP CONSTRAINT "notices_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_studentId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_studentId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_userId_fkey";

-- DropTable
DROP TABLE "colleges";

-- DropTable
DROP TABLE "communities";

-- DropTable
DROP TABLE "community_members";

-- DropTable
DROP TABLE "event_registrations";

-- DropTable
DROP TABLE "event_submissions";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "notices";

-- DropTable
DROP TABLE "project_members";

-- DropTable
DROP TABLE "projects";

-- DropTable
DROP TABLE "skills";

-- DropTable
DROP TABLE "students";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "CommunityCategory";

-- DropEnum
DROP TYPE "CommunityStatus";

-- DropEnum
DROP TYPE "EventCategory";

-- DropEnum
DROP TYPE "EventMode";

-- DropEnum
DROP TYPE "EventOrganizerType";

-- DropEnum
DROP TYPE "EventStatus";

-- DropEnum
DROP TYPE "Level";

-- DropEnum
DROP TYPE "NoticeCategory";

-- DropEnum
DROP TYPE "NoticeStatus";

-- DropEnum
DROP TYPE "ParticipationType";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Specialization";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "location" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile" TEXT,
    "collegeCode" TEXT,
    "website" TEXT,
    "establishedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "College_userId_key" ON "College"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "College_collegeCode_key" ON "College"("collegeCode");

-- CreateIndex
CREATE INDEX "College_name_idx" ON "College"("name");

-- CreateIndex
CREATE INDEX "College_location_idx" ON "College"("location");

-- AddForeignKey
ALTER TABLE "College" ADD CONSTRAINT "College_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
