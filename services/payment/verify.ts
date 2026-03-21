import { createHmac } from "crypto";

export interface VerifyParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Verify Razorpay HMAC-SHA256 payment signature. */
export function verifyRazorpaySignature(params: VerifyParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set");

  const generated = createHmac("sha256", secret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
    .digest("hex");

  return generated === params.razorpay_signature;
}
