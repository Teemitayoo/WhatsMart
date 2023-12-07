import { Category } from '@prisma/client';

import CategoryRepository from './category.repository';
const categoryRepository = new CategoryRepository();

export default class categoryService {
  async createCategory(name: string, id: string): Promise<Category> {
    const category = await categoryRepository.createCategory({
      vendor: { connect: { id } },
      name,
    });
    return category;
  }
}
