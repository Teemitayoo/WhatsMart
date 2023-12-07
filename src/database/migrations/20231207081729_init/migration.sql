/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subdomain` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vendor` ADD COLUMN `subdomain` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Vendor_subdomain_key` ON `Vendor`(`subdomain`);
