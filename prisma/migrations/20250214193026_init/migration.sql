/*
  Warnings:

  - A unique constraint covering the columns `[title,category]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `category` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Creators', 'Sports', 'GlobalElections', 'Mentions', 'Politics', 'Crypto', 'PopCulture', 'Business', 'Science');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "outcome1Votes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "outcome2Votes" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_eventId_userId_key" ON "Vote"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_title_category_key" ON "Event"("title", "category");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
