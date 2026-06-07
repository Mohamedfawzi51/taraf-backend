import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";
import {
  brandFromApi,
  categoryFromApi,
  mapProductDetail,
  mapProductListItem,
} from "../../utils/mappers";
import { buildMeta, parsePagination } from "../../utils/pagination";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  colors: true,
  specs: true,
  relatedFrom: { select: { relatedProductId: true } },
} as const;

export class ProductService {
  async listProducts(query: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.ProductWhereInput = { isDeleted: false };

    if (query.category) {
      const cat = categoryFromApi(query.category);
      if (!cat) {
        throw new AppError(400, ErrorCodes.BAD_REQUEST, "Invalid category");
      }
      where.category = cat;
    }

    if (query.brand) {
      const brand = brandFromApi(query.brand);
      if (!brand) {
        throw new AppError(400, ErrorCodes.BAD_REQUEST, "Invalid brand");
      }
      where.brand = brand;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.priceAmount = {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (query.sort === "price-asc") orderBy = { priceAmount: "asc" };
    if (query.sort === "price-desc") orderBy = { priceAmount: "desc" };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: productInclude,
      }),
    ]);

    return {
      data: products.map((p) =>
        mapProductListItem({
          ...p,
          relatedProductIds: p.relatedFrom.map((r) => r.relatedProductId),
        })
      ),
      meta: buildMeta(total, page, limit),
    };
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      include: productInclude,
    });

    if (!product) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
    }

    const relatedIds = product.relatedFrom.map((r) => r.relatedProductId);
    const relatedProducts = relatedIds.length
      ? await prisma.product.findMany({
          where: { id: { in: relatedIds }, isDeleted: false },
          include: productInclude,
        })
      : [];

    return mapProductDetail(
      { ...product, relatedProductIds: relatedIds },
      relatedProducts.map((p) => ({ ...p, relatedProductIds: [] }))
    );
  }

  async getReviews(slug: string, page = 1, limit = 10) {
    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      select: { id: true },
    });

    if (!product) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
    }

    const { skip, page: p, limit: l } = parsePagination(page, limit);
    const where = { productId: product.id };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: l,
      }),
    ]);

    return {
      data: reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        authorName: r.authorName,
        rating: r.rating,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
      })),
      meta: buildMeta(total, p, l),
    };
  }

  async addReview(
    slug: string,
    userId: string,
    rating: number,
    content: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }

    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      select: { id: true },
    });

    if (!product) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
    }

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: { userId, paymentStatus: "PAID" },
      },
    });

    if (!purchased) {
      throw new AppError(
        403,
        ErrorCodes.FORBIDDEN,
        "Only customers who purchased this product can review it"
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        authorName: user.name,
        rating,
        content,
      },
    });

    const stats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        averageRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      authorName: review.authorName,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
    };
  }
}

export const productService = new ProductService();
