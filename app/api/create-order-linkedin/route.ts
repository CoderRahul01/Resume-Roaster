import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { RATE_LIMITS, SERVICES } from "@/lib/config";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const rl = await checkRateLimit(ip, "createOrder", RATE_LIMITS.createOrder.limit, RATE_LIMITS.createOrder.windowSecs);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please slow down and try again later." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    void req.json().catch(() => ({}));

    const service = SERVICES.linkedinOptimizer;
    const razorpay = getRazorpayClient();
    const receipt = `rcpt_li_${randomUUID().substring(0, 8)}`;

    const order = await razorpay.orders.create({
      amount: service.pricePaise,
      currency: "INR",
      receipt,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("LinkedIn Order Creation Error:", error);
    return NextResponse.json(
      { error: "Could not initiate payment. Please try again." },
      { status: 500 }
    );
  }
}
