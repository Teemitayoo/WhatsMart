import { Prisma, PrismaClient, Vendor, RefreshToken } from '@prisma/client';

const prisma = new PrismaClient();

export default class AuthRepository {
  async getVendor(where: Prisma.VendorWhereUniqueInput) {
    return prisma.vendor.findUnique({
      where,
      select: {
        id: true,
        verified: true,
        password: true,
        whatsappNumber: true,
        storeName: true,
        email: true,
        defaultSubdomain: true,
      },
    });
  }

  async getVendorData(id: string) {
    return prisma.vendor.findUnique({ where: { id } });
  }

  async createVendor(data: Prisma.VendorCreateInput): Promise<Vendor> {
    return prisma.vendor.create({
      data,
    });
  }

  async updateVendor(
    where: Prisma.VendorWhereUniqueInput,
    data: Prisma.VendorUpdateInput,
  ): Promise<Vendor> {
    return prisma.vendor.update({
      where,
      data,
    });
  }
  public verifyVendor = async (email: string) => {
    await prisma.vendor.update({
      where: { email },
      data: { verified: true },
    });
  };

  public async createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<void> {
    await prisma.refreshToken.create({
      data,
    });
  }
  public async getRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
    const token = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    return token;
  }

  public async deleteRefreshToken(refreshToken: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
  }
}
