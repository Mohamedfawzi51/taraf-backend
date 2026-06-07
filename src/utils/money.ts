import { VAT_RATE, FREE_SHIPPING_COUNTRY } from "../config/constants";

export const calculateVat = (subtotal: number): number =>
  Math.round(subtotal * VAT_RATE);

export const calculateShipping = (country: string): number =>
  country === FREE_SHIPPING_COUNTRY ? 0 : 0;

export const calculateCartTotals = (
  subtotal: number,
  country = FREE_SHIPPING_COUNTRY
) => {
  const vat = calculateVat(subtotal);
  const shipping = calculateShipping(country);

  return {
    subtotal,
    vat,
    shipping,
    total: subtotal + vat + shipping,
  };
};

export const getPointsToNextTier = (
  points: number,
  tier: "STANDARD" | "GOLD" | "ELITE"
): number => {
  if (tier === "ELITE") return 0;
  if (tier === "GOLD") return Math.max(0, 15000 - points);
  return Math.max(0, 12450 - points);
};

export const resolveMembershipTier = (
  points: number
): "STANDARD" | "GOLD" | "ELITE" => {
  if (points >= 15000) return "ELITE";
  if (points >= 12450) return "GOLD";
  return "STANDARD";
};
