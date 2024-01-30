import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.interface';
import {
  BadRequestError,
  ConflictError,
  UnAuthorizedError,
  NotFoundError,
} from '../../common/error';
import { nanoid } from 'nanoid';
import { cloudinaryInstance } from '../../utils/fileStorage';
import MailService from '../mail/mail.service';
import { orderemailTemplate } from '../mail/mailTemplates/orderemail';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const mailService = new MailService();
export default class ProductController {
  //Code will be well formated later

  createProduct = async (req: AuthRequest, res: Response) => {
    const localFilePath = req.file?.path || '';
    const { imageURL } = await cloudinaryInstance.uploadImage(localFilePath);

    const {
      productName,
      description,
      productCategory,
      price,
      discountedPrice,
      productStatus,
      unitsAvailable,
    } = req.body;
    //To be able to use postman formdata to test
    const PPrice = parseFloat(price);
    const DDiscountedPrice = parseFloat(discountedPrice);
    const UUnitsAvailable = parseInt(unitsAvailable, 10);

    const vendorId = req.payload!.id;
    try {
      const product = await prisma.product.create({
        data: {
          productName,
          description,
          price: PPrice,
          discountedPrice: DDiscountedPrice,
          productStatus,
          unitsAvailable: UUnitsAvailable,
          productImage: imageURL,
          vendor: {
            connect: { id: vendorId },
          },
          productCategory: {
            connect: { id: productCategory },
          },
        },
      });
    } catch (err: any) {
      throw new BadRequestError('Error while creating product');
    }
    return res.status(201).json({
      success: true,
      message: 'Product has been created',
    });
  };

  getAllProducts = async (req: AuthRequest, res: Response) => {
    const vendorId = req.payload!.id;

    const products = await prisma.product.findMany({
      where: {
        vendorId: vendorId,
      },
      include: {
        productCategory: true,
      },
    });

    res.status(200).json(products);
  };
  getStore = async (req: Request, res: Response) => {
    const subdomain = req.params.subdomain;
    const vendor = await prisma.vendor.findUnique({
      where: {
        defaultSubdomain: subdomain,
      },
      select: {
        id: true,
        whatsappNumber: true,
        storeName: true,
        email: true,
        categories: true,
        products: true,
      },
    });
    if (!vendor) {
      // If no vendor is found using defaultSubdomain, try finding by subdomain
      const alternateVendor = await prisma.vendor.findUnique({
        where: {
          subdomain: subdomain,
        },
        select: {
          id: true,
          whatsappNumber: true,
          storeName: true,
          email: true,
          categories: true,
          products: true,
        },
      });
      if (!alternateVendor) {
        throw new BadRequestError('Vendor not found');
      }
      return res.status(200).json({ vendor: alternateVendor });
    }
    res.status(200).json({ vendor: vendor });
  };

  customizeSubdomain = async (req: AuthRequest, res: Response) => {
    const vendorId = req.payload!.id;
    //check if vendor is subscribed before allowing subdomain customization
    const subdomain = req.body.subdomain;
    const existingVendor = await prisma.vendor.findUnique({
      where: {
        subdomain: subdomain,
      },
    });

    if (existingVendor) {
      throw new BadRequestError('Provided subdomain already in use');
    }

    // Update the subdomain for the current vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { subdomain: subdomain },
    });
    res.status(200).json(updatedVendor.subdomain);
  };

  testupload = async (req: AuthRequest, res: Response) => {
    const gg = req.body;
    console.log(gg);
    const localFilePath = req.file?.path || '';

    const { isSuccess, message, statusCode, imageURL } =
      await cloudinaryInstance.uploadImage(localFilePath);

    return res.status(statusCode).json({
      isSuccess,
      message,
      imageURL,
    });
  };

  createOrder = async (req: Request, res: Response) => {
    const { name, phoneNumber, deliveryAddress, isPickup } = req.body.orderDetails;
    const orderItems = req.body.orderItems;
    const id = req.params.vendorId;

    // create an order Entity for all the orders made
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });
    const vendorInfo = vendor?.email;
    const shortId = nanoid(8);
    const orderEntity = await prisma.order.create({
      data: {
        name,
        phoneNumber,
        deliveryAddress,
        isPickup,
        shortId,
        vendor: { connect: { id } },
      },
    });

    let totalPrice: number = 0;
    // get the price of each product and compute the total price as that is been done
    for (let order of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: order.productId },
      });

      if (!product) {
        throw new NotFoundError('No Product with given Id');
      }

      order.price = parseFloat(product!.price.toFixed());
      totalPrice += order.price * order.quantity;
    }

    for (let order of orderItems) {
      const itemtotalPrice = order.price * order.quantity;
      await prisma.orderItem.create({
        data: {
          product: { connect: { id: order.productId } },
          order: { connect: { id: orderEntity.id } },
          totalAmount: itemtotalPrice,
          quantity: order.quantity,
        },
      });
    }
    // update the order with the total price that will be sent to flutterwave
    await prisma.order.update({
      where: { id: orderEntity.id },
      data: { totalPrice },
    });

    //WHATSAPP MESSAGE CREATION
    const orderLink = `Website.shop/link/${shortId}`;
    let whatsappMessage = `Hi, I'd like to place an order:\n\n`;
    for (let order of orderItems) {
      whatsappMessage += `${order.productName} - Quantity: ${order.quantity}\n`;
    }

    whatsappMessage += `\nTotal Price: *NGN ${totalPrice}*\n\n`;
    whatsappMessage += `*Delivery Details*\n`;
    whatsappMessage += `*Name*: ${name}\n`;
    whatsappMessage += `*Phone*: ${phoneNumber}\n`;
    whatsappMessage += `*Delivery Address*: ${deliveryAddress}\n\n`;
    whatsappMessage += `Checkout cart here:${orderLink}`;

    whatsappMessage += `-----------------------------------\n`;

    whatsappMessage += `Payment Options:\n\n`;
    whatsappMessage += `OPTION 1: Use the link attached to this order 🔗\n`;
    whatsappMessage += `Payments made via the link are automatically confirmed\n\n`;

    whatsappMessage += `OPTION 2: Transfer to this bank account 🏦\n`;
    whatsappMessage += `Acc Num: ${vendor?.accountNumber}\n`;
    whatsappMessage += `Bank: ${vendor?.bankName}\n`;
    whatsappMessage += `Acc Name:${vendor?.accountName}\n`;

    whatsappMessage += `-----------------------------------\n\n`;

    whatsappMessage += `Order ID: KARTIN-${shortId}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);

    // Construct the WhatsApp link
    const whatsappLink = `https://wa.me/${vendor?.whatsappNumber}?text=${encodedMessage}`;
    console.log(whatsappLink);
    // Send Mail to Vendor
    const mailTemplate = orderemailTemplate(vendor?.storeName, orderLink, name, phoneNumber);
    await mailService.sendMail({
      to: vendor?.email,
      subject: 'Pending Order!!',
      html: mailTemplate,
    });

    const Order = { id: orderEntity.id, totalPrice: totalPrice }; //not needed long run
    res.json(whatsappLink);
    //switch to main branch
  };
}
