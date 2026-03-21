import { prisma } from "@/lib/prisma";

export async function validateCoupon(code: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return null;
  if (!coupon.isActive) return null;
  if (coupon.currentUses >= coupon.maxUses) return null;
  if (coupon.validUntil && coupon.validUntil < new Date()) return null;
  if (coupon.validFrom > new Date()) return null;
  return coupon;
}

export async function applyCoupon(code: string, paymentId: string) {
  return prisma.coupon.update({
    where: { code },
    data: { currentUses: { increment: 1 } },
  });
}

export function calculateDiscount(paise: number, discountPercent: number): number {
  const discount = Math.floor((paise * discountPercent) / 100);
  return Math.max(paise - discount, 0);
}
