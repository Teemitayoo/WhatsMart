-- AlterTable
ALTER TABLE `order` MODIFY `totalPrice` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `totalAmount` DECIMAL(65, 30) NOT NULL;
