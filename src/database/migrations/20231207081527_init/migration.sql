/*
  Warnings:

  - A unique constraint covering the columns `[defaultSubdomain]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `vendor` ADD COLUMN `defaultSubdomain` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Vendor_defaultSubdomain_key` ON `Vendor`(`defaultSubdomain`);
