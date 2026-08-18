-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTER');

-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('WEB_DEVELOPER', 'FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER', 'FULL_STACK_DEVELOPER', 'MOBILE_DEVELOPER', 'UI_UX_DESIGNER', 'GRAPHIC_DESIGNER', 'DEVOPS_ENGINEER', 'CLOUD_ENGINEER', 'DATA_SCIENTIST', 'MACHINE_LEARNING_ENGINEER', 'AI_ENGINEER', 'CYBERSECURITY', 'GAME_DEVELOPER', 'QA_ENGINEER', 'DATABASE_ADMINISTRATOR', 'SOFTWARE_ENGINEER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "specilization" "Specialization" NOT NULL,
    "phone" TEXT,
    "college" TEXT NOT NULL DEFAULT 'Vedas College',
    "faculty" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "batch" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_studentId_name_key" ON "skills"("studentId", "name");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
