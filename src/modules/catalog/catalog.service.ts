import { prisma } from "../../config/db";
import { brandToApi, categoryToApi } from "../../utils/mappers";

export class CatalogService {
  async getFilters() {
    const [priceRange, categories, brands] = await Promise.all([
      prisma.product.aggregate({
        where: { isDeleted: false },
        _min: { priceAmount: true },
        _max: { priceAmount: true },
      }),
      prisma.product.groupBy({
        by: ["category"],
        where: { isDeleted: false },
        _count: { category: true },
      }),
      prisma.product.groupBy({
        by: ["brand"],
        where: { isDeleted: false },
        _count: { brand: true },
      }),
    ]);

    return {
      categories: categories.map((c) => ({
        value: categoryToApi(c.category),
        count: c._count.category,
      })),
      brands: brands.map((b) => ({
        value: brandToApi(b.brand),
        count: b._count.brand,
      })),
      priceRange: {
        min: priceRange._min.priceAmount ?? 0,
        max: priceRange._max.priceAmount ?? 0,
      },
    };
  }
}

export const catalogService = new CatalogService();
