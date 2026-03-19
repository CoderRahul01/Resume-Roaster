import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!client) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId) throw new Error("RAZORPAY_KEY_ID is not set");
    if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not set");
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}
