-- CreateTable
CREATE TABLE "AppAuth" (
    "id" TEXT NOT NULL,
    "sessionSecret" TEXT NOT NULL,
    "passwordHash" TEXT,
    "passwordSalt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppAuth_pkey" PRIMARY KEY ("id")
);
