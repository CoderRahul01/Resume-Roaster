import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { RoastResponse } from "@/types";

export async function saveRoast(data: {
  resumeText: string;
  overallScore: number;
  feedback: RoastResponse["roast"];
  authorId?: string;
}) {
  return prisma.roast.create({
    data: {
      resumeText: data.resumeText,
      overallScore: data.overallScore,
      feedback: data.feedback as unknown as Prisma.InputJsonValue,
      authorId: data.authorId,
    },
  });
}

export async function getRoastsByUser(userId: string) {
  return prisma.roast.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });
}
