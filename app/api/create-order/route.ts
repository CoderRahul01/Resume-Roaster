import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { RATE_LIMITS, SERVICES, parseCouponCodes } from "@/lib/config";
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

    const body = await req.json().catch(() => ({}));
    const couponCode: string | undefined = typeof body?.couponCode === "string"
      ? body.couponCode.trim().toUpperCase()
      : undefined;

    const basePaise = SERVICES.rewrite.pricePaise;
    let finalPaise = basePaise;
    let discountPercent = 0;

    if (couponCode) {
      const coupons = parseCouponCodes();
      const pct = coupons.get(couponCode);
      if (pct !== undefined) {
        discountPercent = pct;
        finalPaise = Math.max(Math.floor(basePaise * (1 - pct / 100)), 0);
      }
    }

    // 100% off — skip Razorpay entirely
    if (finalPaise === 0) {
      return NextResponse.json({
        isFree: true,
        couponCode,
        discountPercent,
      });
    }

    const razorpay = getRazorpayClient();
    const receipt = `rcpt_${randomUUID().substring(0, 8)}`;

    const order = await razorpay.orders.create({
      amount: finalPaise,
      currency: "INR",
      receipt,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      discountPercent,
      isFree: false,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Could not initiate payment. Please try again." },
      { status: 500 }
    );
  }
}
