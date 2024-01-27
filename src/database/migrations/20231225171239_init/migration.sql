/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `order` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `totalAmount`,
    ADD COLUMN `totalPrice` DOUBLE NOT NULL;
