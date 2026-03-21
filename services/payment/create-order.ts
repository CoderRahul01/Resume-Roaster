import { getRazorpayClient } from "@/lib/razorpay";
import { SERVICES, type ServiceKey } from "@/lib/config";
import { randomUUID } from "crypto";
import { createPayment } from "@/services/db";

export interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

/**
 * Creates a Razorpay order and persists it in our database with status "CREATED".
 */
export async function createRazorpayOrder(
  serviceKey: ServiceKey,
  discountedPaise?: number,
): Promise<OrderData> {
  const service = SERVICES[serviceKey];
  if (!("pricePaise" in service)) {
    throw new Error(`Service "${serviceKey}" has no price configured.`);
  }

  const razorpay = getRazorpayClient();
  const receipt = `rcpt_${randomUUID().substring(0, 8)}`;
  const amount = discountedPaise ?? (service as { pricePaise: number }).pricePaise;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
  });

  // Persist the order in our database so the webhook can find it
  await createPayment({
    razorpayOrderId: order.id,
    amount: order.amount as number,
    service: serviceKey,
  }).catch((err) => {
    // If DB fails, we still return the order so the user can pay, 
    // but the webhook might fail later. We log this as a warning.
    console.warn("Could not persist payment record to DB:", err);
  });

  return {
    orderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}
