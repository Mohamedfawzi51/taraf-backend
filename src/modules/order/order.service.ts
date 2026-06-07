import { prisma } from "../../config/db";
import { CUSTOMER_ORDER_PREFIX } from "../../config/constants";
import { AppError, ErrorCodes } from "../../utils/errors";
import { calculateCartTotals } from "../../utils/money";
import { buildMeta, parsePagination } from "../../utils/pagination";
import { cartService } from "../cart/cart.service";

const generateOrderNumber = async (): Promise<string> => {
  const count = await prisma.order.count();
  return `${CUSTOMER_ORDER_PREFIX}-${89231 + count}`;
};

export class OrderService {
  async checkout(userId: string, addressId: string, paymentMethod: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Address not found");
    }

    const cart = await cartService.getCartForCheckout(userId);

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new AppError(
          400,
          ErrorCodes.BAD_REQUEST,
          `Insufficient stock for ${item.product.name}`
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.priceAmount * item.quantity,
      0
    );
    const totals = calculateCartTotals(subtotal, address.country);
    const orderNumber = await generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          shippingAddressId: addressId,
          paymentMethod,
          paymentStatus: "PAID",
          status: "PROCESSING",
          subtotal: totals.subtotal,
          vat: totals.vat,
          shipping: totals.shipping,
          total: totals.total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.priceAmount,
              quantity: item.quantity,
              image: item.product.images[0]?.src ?? "",
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      const pointsEarned = Math.floor(totals.total / 10);
      await tx.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });

      return created;
    });

    return this.mapOrder(order);
  }

  async listOrders(userId: string, page = 1, limit = 10) {
    const { skip, page: p, limit: l } = parsePagination(page, limit);
    const where = { userId };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: l,
        include: { items: true },
      }),
    ]);

    return {
      data: orders.map(this.mapOrder),
      meta: buildMeta(total, p, l),
    };
  }

  async getOrder(userId: string, id: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        userId,
      },
      include: { items: true, shippingAddress: true },
    });

    if (!order) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Order not found");
    }

    return this.mapOrder(order);
  }

  private mapOrder(order: {
    id: string;
    orderNumber: string;
    userId: string;
    status: string;
    paymentStatus: string;
    subtotal: number;
    vat: number;
    shipping: number;
    total: number;
    shippingAddressId: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }>;
  }) {
    return {
      id: order.orderNumber,
      userId: order.userId,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      subtotal: order.subtotal,
      vat: order.vat,
      shipping: order.shipping,
      total: order.total,
      shippingAddressId: order.shippingAddressId,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

export const orderService = new OrderService();
