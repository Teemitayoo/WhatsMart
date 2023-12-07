import express from 'express';
import 'express-async-errors';
import { protect } from '../../common/auth';
import ProductController from './product.controller';

const router = express.Router();
const productController = new ProductController();

router.post('/create-product', protect(), productController.createProduct);
router.get('/get-vendor-products', protect(), productController.getAllProducts);
router.get('/:subdomain', productController.getStore);
router.post('/customizesubdomain', protect(), productController.customizeSubdomain);

export default router;
