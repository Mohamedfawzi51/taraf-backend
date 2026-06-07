import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";
import { buildMeta, parsePagination } from "../../utils/pagination";

export class CollectionService {
  async listCollections() {
    const collections = await prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          select: { productId: true },
        },
      },
    });

    return collections.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      image: c.image,
      imageAlt: c.imageAlt,
      productIds: c.products.map((p) => p.productId),
      sortOrder: c.sortOrder,
    }));
  }

  async getCollectionProducts(slug: string, page = 1, limit = 12) {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Collection not found");
    }

    const allProducts = collection.products
      .map((cp) => cp.product)
      .filter((p) => !p.isDeleted);

    const { page: p, limit: l, skip } = parsePagination(page, limit);
    const slice = allProducts.slice(skip, skip + l);

    return {
      data: slice.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceAmount: product.priceAmount,
        listDescription: product.listDescription,
        images: product.images.map((img) => ({
          src: img.src,
          alt: img.alt,
        })),
      })),
      meta: buildMeta(allProducts.length, p, l),
    };
  }
}

export const collectionService = new CollectionService();
