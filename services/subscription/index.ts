import { prisma } from "@/lib/prisma";

const FREE_DAILY_ROASTS = 5;
const PRO_DAILY_ROASTS = 50;
const FREE_MONTHLY_REWRITES = 0;
const PRO_MONTHLY_REWRITES = 10;

export async function canUserRoast(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const tier = sub?.tier ?? "FREE";
  const limit = tier === "PRO" ? PRO_DAILY_ROASTS : FREE_DAILY_ROASTS;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.roast.count({
    where: { authorId: userId, createdAt: { gte: today } },
  });

  return count < limit;
}

export async function canUserRewrite(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const tier = sub?.tier ?? "FREE";
  if (tier === "FREE") return false; // free users pay per rewrite

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const count = await prisma.payment.count({
    where: {
      userId,
      service: "rewrite",
      status: "CAPTURED",
      createdAt: { gte: monthStart },
    },
  });

  return count < PRO_MONTHLY_REWRITES;
}

export async function getRemainingQuota(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const tier = sub?.tier ?? "FREE";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const roastsToday = await prisma.roast.count({
    where: { authorId: userId, createdAt: { gte: today } },
  });

  const rewritesThisMonth = await prisma.payment.count({
    where: {
      userId,
      service: "rewrite",
      status: "CAPTURED",
      createdAt: { gte: monthStart },
    },
  });

  const roastLimit = tier === "PRO" ? PRO_DAILY_ROASTS : FREE_DAILY_ROASTS;
  const rewriteLimit = tier === "PRO" ? PRO_MONTHLY_REWRITES : FREE_MONTHLY_REWRITES;

  return {
    tier,
    roasts: { used: roastsToday, limit: roastLimit, remaining: Math.max(0, roastLimit - roastsToday) },
    rewrites: { used: rewritesThisMonth, limit: rewriteLimit, remaining: Math.max(0, rewriteLimit - rewritesThisMonth) },
  };
}
