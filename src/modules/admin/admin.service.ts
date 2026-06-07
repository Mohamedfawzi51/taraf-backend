import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";
import { buildMeta, parsePagination } from "../../utils/pagination";
import { brandFromApi, categoryFromApi } from "../../utils/mappers";
import {
  deleteFromCloudinary,
  uploadManyToCloudinary,
} from "../../utils/cloudinaryUpload";
import { slugify } from "../../utils/slugify";
import { Prisma, OrderStatus } from "@prisma/client";

export class AdminService {
  async getStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      currentSales,
      previousSales,
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.product.findMany({
        where: { isDeleted: false, stock: { lte: 20 } },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
        take: 10,
      }),
    ]);

    const calcChange = (current: number, previous: number) =>
      previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);

    const totalSales = currentSales._sum.total ?? 0;
    const prevSales = previousSales._sum.total ?? 0;

    return {
      totalSales,
      totalSalesChange: calcChange(totalSales, prevSales),
      totalOrders: currentOrders,
      totalOrdersChange: calcChange(currentOrders, previousOrders),
      newCustomers: currentCustomers,
      newCustomersChange: calcChange(currentCustomers, previousCustomers),
      conversionRate: 3.2,
      conversionRateChange: 0.5,
      revenueChart: [],
      inventoryAlerts: lowStockProducts.map((p) => ({
        productId: p.id,
        name: p.name,
        image: p.images[0]?.src ?? "",
        stockPercent: Math.min(100, p.stock),
      })),
    };
  }

  async listOrders(query: { status?: string; page?: number; limit?: number }) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.OrderWhereInput = {};
    if (query.status) {
      where.status = query.status.toUpperCase() as OrderStatus;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { items: true, user: { select: { name: true, email: true } } },
      }),
    ]);

    return {
      data: orders,
      meta: buildMeta(total, page, limit),
    };
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() as never },
    });
    return order;
  }

  async listProducts(page = 1, limit = 20) {
    const { skip, page: p, limit: l } = parsePagination(page, limit);
    const where = { isDeleted: false };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: l,
        include: { images: { take: 1 } },
      }),
    ]);

    return { data: products, meta: buildMeta(total, p, l) };
  }

  async createProduct(
    data: Record<string, unknown>,
    files?: Express.Multer.File[]
  ) {
    const slug = slugify(String(data.name));
    let uploaded: Awaited<ReturnType<typeof uploadManyToCloudinary>> = [];

    if (files?.length) {
      uploaded = await uploadManyToCloudinary(files);
    }

    return prisma.product.create({
      data: {
        slug,
        name: String(data.name),
        description: String(data.description),
        listDescription: data.listDescription ? String(data.listDescription) : null,
        collection: data.collection ? String(data.collection) : null,
        badge: data.badge ? String(data.badge) : null,
        priceAmount: Number(data.priceAmount),
        originalPriceAmount: data.originalPriceAmount
          ? Number(data.originalPriceAmount)
          : null,
        discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
        category: categoryFromApi(String(data.category))!,
        brand: brandFromApi(String(data.brand))!,
        stock: Number(data.stock ?? 0),
        listBadgeLabel: data.listBadgeLabel ? String(data.listBadgeLabel) : null,
        listBadgeVariant: data.listBadgeVariant
          ? (String(data.listBadgeVariant).toUpperCase() as "PRIMARY" | "SECONDARY")
          : null,
        images: uploaded.length
          ? {
              create: uploaded.map((img, i) => ({
                src: img.url,
                publicId: img.publicId,
                alt: String(data.name),
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = {};

    if (data.name) {
      updateData.name = String(data.name);
      updateData.slug = slugify(String(data.name));
    }
    if (data.description) updateData.description = String(data.description);
    if (data.priceAmount !== undefined) {
      updateData.priceAmount = Number(data.priceAmount);
    }
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(data.isFeatured);
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async softDeleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getInventory() {
    return prisma.product.findMany({
      where: { isDeleted: false, stock: { lte: 20 } },
      include: { images: { take: 1 } },
      orderBy: { stock: "asc" },
    });
  }

  async listCustomers(page = 1, limit = 20) {
    const { skip, page: p, limit: l } = parsePagination(page, limit);
    const where = { role: "CUSTOMER" as const };

    const [total, customers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          membershipTier: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      }),
    ]);

    return { data: customers, meta: buildMeta(total, p, l) };
  }

  async exportReport() {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const header = "orderNumber,total,status,createdAt\n";
    const rows = orders
      .map((o) => `${o.orderNumber},${o.total},${o.status},${o.createdAt.toISOString()}`)
      .join("\n");

    return header + rows;
  }
}

export const adminService = new AdminService();
