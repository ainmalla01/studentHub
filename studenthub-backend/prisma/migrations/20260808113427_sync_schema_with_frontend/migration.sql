/*
  Warnings:

  - You are about to drop the column `college` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `specilization` on the `students` table. All the data in the column will be lost.
  - Added the required column `specialization` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventOrganizerType" AS ENUM ('COLLEGE', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('WORKSHOP', 'HACKATHON', 'SEMINAR', 'WEBINAR', 'COMPETITION', 'BOOTCAMP', 'OTHER');

-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ParticipationType" AS ENUM ('INDIVIDUAL', 'TEAM');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'UNDER_REVIEW', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING_EVALUATION', 'EVALUATED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING_CHECK', 'APPROVED', 'NEEDS_REVISION', 'REJECTED');

-- CreateEnum
CREATE TYPE "NoticeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NoticeCategory" AS ENUM ('GENERAL', 'ACADEMIC', 'EVENT', 'PROJECT', 'COMMUNITY', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CommunityCategory" AS ENUM ('TECH', 'PROJECT', 'CAREER', 'ACADEMIC', 'HOBBY', 'OTHER');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COLLEGE_ADMIN';

-- AlterTable
ALTER TABLE "students" DROP COLUMN "college",
DROP COLUMN "specilization",
ADD COLUMN     "collegeId" TEXT,
ADD COLUMN     "specialization" "Specialization" NOT NULL;

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "repositoryUrl" TEXT,
    "demoUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING_CHECK',
    "feedback" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "banner" TEXT,
    "organizerType" "EventOrganizerType" NOT NULL,
    "organizerId" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "mode" "EventMode" NOT NULL,
    "venue" TEXT,
    "meetingLink" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "submissionDeadline" TIMESTAMP(3),
    "prizePool" DOUBLE PRECISION,
    "assignedJudges" TEXT[],
    "participationType" "ParticipationType" NOT NULL,
    "maxParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "requirements" TEXT,
    "prize" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_submissions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "leader" TEXT NOT NULL,
    "membersCount" INTEGER NOT NULL DEFAULT 1,
    "projectTitle" TEXT NOT NULL,
    "githubUrl" TEXT,
    "demoUrl" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING_EVALUATION',
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "NoticeCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "NoticeStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "category" "CommunityCategory" NOT NULL,
    "status" "CommunityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_members" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colleges_code_key" ON "colleges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_email_key" ON "colleges"("email");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_adminId_key" ON "colleges"("adminId");

-- CreateIndex
CREATE INDEX "projects_collegeId_idx" ON "projects"("collegeId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectId_studentId_key" ON "project_members"("projectId", "studentId");

-- CreateIndex
CREATE INDEX "events_collegeId_idx" ON "events"("collegeId");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");

-- CreateIndex
CREATE INDEX "events_startDateTime_idx" ON "events"("startDateTime");

-- CreateIndex
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations"("eventId");

-- CreateIndex
CREATE INDEX "event_registrations_studentId_idx" ON "event_registrations"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_eventId_studentId_key" ON "event_registrations"("eventId", "studentId");

-- CreateIndex
CREATE INDEX "event_submissions_eventId_idx" ON "event_submissions"("eventId");

-- CreateIndex
CREATE INDEX "event_submissions_studentId_idx" ON "event_submissions"("studentId");

-- CreateIndex
CREATE INDEX "event_submissions_status_idx" ON "event_submissions"("status");

-- CreateIndex
CREATE INDEX "notices_collegeId_idx" ON "notices"("collegeId");

-- CreateIndex
CREATE INDEX "notices_status_idx" ON "notices"("status");

-- CreateIndex
CREATE INDEX "notices_category_idx" ON "notices"("category");

-- CreateIndex
CREATE INDEX "communities_collegeId_idx" ON "communities"("collegeId");

-- CreateIndex
CREATE INDEX "communities_category_idx" ON "communities"("category");

-- CreateIndex
CREATE INDEX "communities_status_idx" ON "communities"("status");

-- CreateIndex
CREATE INDEX "community_members_communityId_idx" ON "community_members"("communityId");

-- CreateIndex
CREATE INDEX "community_members_studentId_idx" ON "community_members"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_communityId_studentId_key" ON "community_members"("communityId", "studentId");

-- CreateIndex
CREATE INDEX "students_collegeId_idx" ON "students"("collegeId");

-- CreateIndex
CREATE INDEX "students_faculty_idx" ON "students"("faculty");

-- CreateIndex
CREATE INDEX "students_batch_idx" ON "students"("batch");

-- CreateIndex
CREATE INDEX "students_semester_idx" ON "students"("semester");

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_submissions" ADD CONSTRAINT "event_submissions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_submissions" ADD CONSTRAINT "event_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
