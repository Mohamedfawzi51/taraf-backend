import { ProductBrand, ProductCategory, BadgeVariant } from "@prisma/client";

export const categoryToApi = (category: ProductCategory): string =>
  category.toLowerCase();

export const categoryFromApi = (value: string): ProductCategory | null => {
  const map: Record<string, ProductCategory> = {
    perfumes: "PERFUMES",
    watches: "WATCHES",
    bags: "BAGS",
    accessories: "ACCESSORIES",
  };
  return map[value.toLowerCase()] ?? null;
};

export const brandToApi = (brand: ProductBrand): string =>
  brand.toLowerCase().replace(/_/g, "-");

export const brandFromApi = (value: string): ProductBrand | null => {
  const map: Record<string, ProductBrand> = {
    "unique-diamond": "UNIQUE_DIAMOND",
    orad: "ORAD",
    "taraf-collection": "TARAF_COLLECTION",
  };
  return map[value.toLowerCase()] ?? null;
};

export const badgeVariantToApi = (
  variant: BadgeVariant | null | undefined
): "primary" | "secondary" | undefined => {
  if (!variant) return undefined;
  return variant === "PRIMARY" ? "primary" : "secondary";
};

export const membershipTierToApi = (
  tier: "STANDARD" | "GOLD" | "ELITE"
): "standard" | "gold" | "elite" => tier.toLowerCase() as "standard" | "gold" | "elite";

export const orderStatusToApi = (
  status: string
): string => status.toLowerCase();

export type ProductWithDetails = {
  id: string;
  slug: string;
  collection: string | null;
  name: string;
  badge: string | null;
  priceAmount: number;
  originalPriceAmount: number | null;
  discountPercent: number | null;
  description: string;
  listDescription: string | null;
  category: ProductCategory;
  brand: ProductBrand;
  listBadgeLabel: string | null;
  listBadgeVariant: BadgeVariant | null;
  stock: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{ src: string; alt: string; sortOrder: number }>;
  colors: Array<{ id: string; name: string; hexOrClass: string }>;
  specs: Array<{ label: string; value: string }>;
  relatedProductIds?: string[];
};

export const mapProductListItem = (product: ProductWithDetails) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  collection: product.collection ?? undefined,
  badge: product.badge ?? undefined,
  priceAmount: product.priceAmount,
  originalPriceAmount: product.originalPriceAmount ?? undefined,
  discountPercent: product.discountPercent ?? undefined,
  listDescription: product.listDescription ?? undefined,
  category: categoryToApi(product.category),
  brand: brandToApi(product.brand),
  listBadge: product.listBadgeLabel
    ? {
        label: product.listBadgeLabel,
        variant: badgeVariantToApi(product.listBadgeVariant) ?? "primary",
      }
    : undefined,
  images: product.images.map((img) => ({
    src: img.src,
    alt: img.alt,
    sortOrder: img.sortOrder,
  })),
  averageRating: product.averageRating,
  reviewCount: product.reviewCount,
  stock: product.stock,
});

export const mapProductDetail = (
  product: ProductWithDetails,
  relatedProducts: ProductWithDetails[] = []
) => ({
  ...mapProductListItem(product),
  description: product.description,
  colors: product.colors.map((c) => ({
    id: c.id,
    name: c.name,
    hexOrClass: c.hexOrClass,
  })),
  specs: product.specs.map((s) => ({ label: s.label, value: s.value })),
  relatedProductIds: product.relatedProductIds ?? [],
  relatedProducts: relatedProducts.map(mapProductListItem),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});
