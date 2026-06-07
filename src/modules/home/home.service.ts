import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";

export class HomeService {
  async getHome() {
    const home = await prisma.homeContent.findUnique({ where: { id: 1 } });

    if (!home) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Home content not configured");
    }

    const collections = await prisma.collection.findMany({
      where: { id: { in: home.featuredCollectionIds } },
      orderBy: { sortOrder: "asc" },
    });

    return {
      hero: home.hero,
      bentoItems: home.bentoItems,
      featuredCollections: collections.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        image: c.image,
        imageAlt: c.imageAlt,
      })),
      features: home.features,
      newsletterEnabled: home.newsletterEnabled,
    };
  }
}

export const homeService = new HomeService();
