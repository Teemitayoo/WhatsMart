import { Request, Response } from 'express';
import CategoryService from './category.service';
import { AuthRequest } from '../auth/auth.interface';

const categoryService = new CategoryService();

export default class CategoryController {
  createCategory = async (req: AuthRequest, res: Response) => {
    const id = req.payload!.id;
    const name = req.body.name;
    const category = await categoryService.createCategory(name, id);
    return res.json({ success: true, category });
  };
}
