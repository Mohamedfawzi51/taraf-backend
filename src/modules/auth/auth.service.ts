import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { AppError, ErrorCodes } from "../../utils/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../middleware/auth";
import { membershipTierToApi } from "../../utils/mappers";
import { getPointsToNextTier, resolveMembershipTier } from "../../utils/money";
import { cartService } from "../cart/cart.service";

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
      },
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.mapUser(user), ...tokens };
  }

  async login(data: { email: string; password: string }, sessionId?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid credentials");
    }

    if (sessionId) {
      await cartService.mergeGuestCart(sessionId, user.id);
    }

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.mapUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Refresh token expired");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "User not found");
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    return this.issueTokens(user.id, user.role);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    return this.mapUser(user);
  }

  async updateProfile(
    userId: string,
    data: Partial<{ name: string; email: string; phone: string; avatar: string | null }>
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.phone && { phone: data.phone }),
        ...(data.avatar !== undefined && { avatar: data.avatar || null }),
      },
    });
    return this.mapUser(user);
  }

  private async issueTokens(userId: string, role: "CUSTOMER" | "ADMIN") {
    const payload = { userId, role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private mapUser(user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    membershipTier: "STANDARD" | "GOLD" | "ELITE";
    loyaltyPoints: number;
    role: "CUSTOMER" | "ADMIN";
    createdAt: Date;
  }) {
    const tier = resolveMembershipTier(user.loyaltyPoints);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar ?? undefined,
      role: user.role.toLowerCase(),
      membershipTier: membershipTierToApi(tier),
      loyaltyPoints: user.loyaltyPoints,
      pointsToNextTier: getPointsToNextTier(user.loyaltyPoints, tier),
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
