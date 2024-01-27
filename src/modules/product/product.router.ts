import express from 'express';
import 'express-async-errors';
import { protect } from '../../common/auth';
import ProductController from './product.controller';
import { multerUpload } from '../../utils/fileStorage/multer';

const router = express.Router();
const productController = new ProductController();

router.post(
  '/create-product',
  protect(),
  multerUpload.single('image'),
  productController.createProduct,
);
router.get('/get-vendor-products', protect(), productController.getAllProducts);
router.get('/:subdomain', productController.getStore);
router.post('/customizesubdomain', protect(), productController.customizeSubdomain);
router.post('/upload', multerUpload.single('image'), productController.testupload);
router.post('/create-order/:vendorId', productController.createOrder);
export default router;
