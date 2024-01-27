import { Prisma, PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();
export default class CategoryRepository {
  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }
}
