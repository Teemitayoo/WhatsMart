import express from 'express';
import 'express-async-errors';
import { protect } from '../../common/auth';
import CategoryController from './category.controller';

const router = express.Router();
const categoryController = new CategoryController();

router.post('/create-category', protect(true), categoryController.createCategory);

export default router;
