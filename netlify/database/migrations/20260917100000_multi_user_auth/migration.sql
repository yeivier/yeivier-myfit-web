-- Multi-user auth: replace the single shared-password login (AppAuth) with
-- real per-user accounts and a Coach/Athlete role, so a coach can manage
-- multiple athletes instead of the app being single-tenant.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COACH', 'ATHLETE');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "role" "Role" NOT NULL DEFAULT 'ATHLETE',
    ADD COLUMN "passwordHash" TEXT,
    ADD COLUMN "passwordSalt" TEXT,
    ADD COLUMN "coachId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data migration: the existing single shared password (if the app was ever
-- used before this change) becomes the password of the app's original
-- owner account, promoted to COACH so they keep full access.
UPDATE "User" u
SET "passwordHash" = a."passwordHash",
    "passwordSalt" = a."passwordSalt",
    "role" = 'COACH'
FROM "AppAuth" a
WHERE a."id" = 'default'
  AND a."passwordHash" IS NOT NULL
  AND u."email" = 'javiercorralv@gmail.com';

-- AlterTable: AppAuth goes back to holding only the session secret.
ALTER TABLE "AppAuth" DROP COLUMN "passwordHash";
ALTER TABLE "AppAuth" DROP COLUMN "passwordSalt";

-- CreateTable
CREATE TABLE "CoachInvite" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachInvite_token_key" ON "CoachInvite"("token");

-- AddForeignKey
ALTER TABLE "CoachInvite" ADD CONSTRAINT "CoachInvite_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
