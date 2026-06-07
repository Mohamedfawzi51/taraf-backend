import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";
import { calculateCartTotals } from "../../utils/money";
import { v4 as uuidv4 } from "uuid";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
        },
      },
    },
  },
} as const;

export class CartService {
  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: cartInclude,
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: cartInclude,
        });
      }
      return { cart, sessionId: undefined as string | undefined };
    }

    const sid = sessionId || uuidv4();
    let cart = await prisma.cart.findUnique({
      where: { sessionId: sid },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId: sid },
        include: cartInclude,
      });
    }

    return { cart, sessionId: sid };
  }

  async getCartResponse(userId?: string, sessionId?: string) {
    const { cart, sessionId: newSessionId } = await this.getOrCreateCart(
      userId,
      sessionId
    );
    return { data: this.mapCart(cart), sessionId: newSessionId };
  }

  async addItem(
    productId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ) {
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
    }

    if (quantity > product.stock) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Insufficient stock");
    }

    const { cart } = await this.getOrCreateCart(userId, sessionId);

    const existing = cart.items.find((i) => i.productId === productId);
    const newQty = (existing?.quantity ?? 0) + quantity;

    if (newQty > product.stock) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Insufficient stock");
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.getCartResponse(userId, sessionId);
  }

  async updateItem(
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ) {
    const { cart } = await this.getOrCreateCart(userId, sessionId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Cart item not found");
    }

    if (quantity > item.product.stock) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Insufficient stock");
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCartResponse(userId, sessionId);
  }

  async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const { cart } = await this.getOrCreateCart(userId, sessionId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Cart item not found");
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCartResponse(userId, sessionId);
  }

  async clearCart(userId?: string, sessionId?: string) {
    const { cart } = await this.getOrCreateCart(userId, sessionId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCartResponse(userId, sessionId);
  }

  async mergeGuestCart(sessionId: string, userId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart?.items.length) return;

    let userCart = await prisma.cart.findUnique({ where: { userId } });
    if (!userCart) {
      userCart = await prisma.cart.create({ data: { userId } });
    }

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: userCart.id,
            productId: item.productId,
          },
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  async getCartForCheckout(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart?.items.length) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Cart is empty");
    }

    return cart;
  }

  private mapCart(cart: {
    id: string;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      product: {
        slug: string;
        name: string;
        listDescription: string | null;
        priceAmount: number;
        images: Array<{ src: string; alt: string }>;
      };
    }>;
  }) {
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      description: item.product.listDescription ?? "",
      price: item.product.priceAmount,
      quantity: item.quantity,
      image: item.product.images[0]?.src ?? "",
      imageAlt: item.product.images[0]?.alt ?? item.product.name,
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totals = calculateCartTotals(subtotal);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      itemCount,
      ...totals,
    };
  }
}

export const cartService = new CartService();
