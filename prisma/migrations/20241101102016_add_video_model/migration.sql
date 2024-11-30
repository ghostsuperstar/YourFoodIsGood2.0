/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - Added the required column `heading` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagelink` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviews` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "content",
ADD COLUMN     "heading" TEXT NOT NULL,
ADD COLUMN     "imagelink" TEXT NOT NULL,
ADD COLUMN     "reviews" TEXT NOT NULL;
