import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";
import { authService } from "../auth/auth.service";
import { getPointsToNextTier, resolveMembershipTier } from "../../utils/money";
import { membershipTierToApi } from "../../utils/mappers";

export class AccountService {
  getProfile = (userId: string) => authService.getMe(userId);

  updateProfile = authService.updateProfile.bind(authService);

  async listAddresses(userId: string) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return addresses.map((a) => ({
      id: a.id,
      userId: a.userId,
      label: a.label,
      icon: a.icon.toLowerCase(),
      line1: a.line1,
      line2: a.line2 ?? undefined,
      city: a.city,
      country: a.country,
      isDefault: a.isDefault,
    }));
  }

  async addAddress(
    userId: string,
    data: {
      label: string;
      icon: string;
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      isDefault?: boolean;
    }
  ) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: data.label,
        icon: data.icon.toUpperCase() as "HOME" | "WORK",
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        country: data.country || "SA",
        isDefault: data.isDefault ?? false,
      },
    });

    return address;
  }

  async updateAddress(
    userId: string,
    id: string,
    data: Partial<{
      label: string;
      icon: string;
      line1: string;
      line2: string | null;
      city: string;
      country: string;
      isDefault: boolean;
    }>
  ) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Address not found");
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id },
      data: {
        ...(data.label && { label: data.label }),
        ...(data.icon && { icon: data.icon.toUpperCase() as "HOME" | "WORK" }),
        ...(data.line1 && { line1: data.line1 }),
        ...(data.line2 !== undefined && { line2: data.line2 }),
        ...(data.city && { city: data.city }),
        ...(data.country && { country: data.country }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  async deleteAddress(userId: string, id: string) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Address not found");
    }
    await prisma.address.delete({ where: { id } });
  }

  async setDefaultAddress(userId: string, id: string) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Address not found");
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
  }

  async getLoyalty(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }

    const tier = resolveMembershipTier(user.loyaltyPoints);
    return {
      loyaltyPoints: user.loyaltyPoints,
      membershipTier: membershipTierToApi(tier),
      pointsToNextTier: getPointsToNextTier(user.loyaltyPoints, tier),
    };
  }

  async listFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    });

    return favorites.map((f) => ({
      productId: f.productId,
      slug: f.product.slug,
      name: f.product.name,
      priceAmount: f.product.priceAmount,
      image: f.product.images[0]?.src ?? "",
    }));
  }

  async addFavorite(userId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
    });
    if (!product) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
    }

    await prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  }

  async removeFavorite(userId: string, productId: string) {
    await prisma.favorite.deleteMany({ where: { userId, productId } });
  }
}

export const accountService = new AccountService();
