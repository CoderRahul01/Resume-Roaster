import { prisma } from "@/lib/prisma";

export async function createPayment(data: {
  razorpayOrderId: string;
  amount: number;
  service: string;
  userId?: string;
  couponCode?: string;
}) {
  return prisma.payment.create({ data: { ...data, status: "CREATED" } });
}

export async function updatePaymentStatus(
  razorpayOrderId: string,
  status: "CAPTURED" | "FAILED" | "REFUNDED",
  paymentId?: string,
  signature?: string,
) {
  return prisma.payment.update({
    where: { razorpayOrderId },
    data: {
      status,
      ...(paymentId && { razorpayPaymentId: paymentId }),
      ...(signature && { razorpaySignature: signature }),
    },
  });
}

export async function getPaymentByOrderId(razorpayOrderId: string) {
  return prisma.payment.findUnique({ where: { razorpayOrderId } });
}
