/*
  Warnings:

  - Made the column `defaultSubdomain` on table `vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `vendor` MODIFY `defaultSubdomain` VARCHAR(191) NOT NULL,
    MODIFY `subdomain` VARCHAR(191) NULL;
