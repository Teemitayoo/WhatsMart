/*
  Warnings:

  - You are about to drop the column `productImageLink` on the `product` table. All the data in the column will be lost.
  - Added the required column `productImage` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `productImageLink`,
    ADD COLUMN `productImage` VARCHAR(191) NOT NULL;
