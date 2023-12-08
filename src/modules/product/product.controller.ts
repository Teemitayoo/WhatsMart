import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.interface';
import { BadRequestError, ConflictError, UnAuthorizedError } from '../../common/error';
import { multerUpload } from '../../utils/fileStorage/multer';
import { cloudinaryInstance } from '../../utils/fileStorage';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default class ProductController {
  //Code will be well formated later
  //will work on image upload later
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
}
