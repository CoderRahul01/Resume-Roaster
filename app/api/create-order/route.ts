import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpayClient } from "@/lib/razorpay";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { RATE_LIMITS, RESUME, SERVICES } from "@/lib/config";

export const dynamic = "force-dynamic";

const schema = z.object({
  resumeText: z
    .string({ required_error: "Resume text is required" })
    .min(RESUME.minChars, "Resume is too short.")
    .max(RESUME.maxChars, "Resume is too long."),
});

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(getIP(req), "create-order", RATE_LIMITS.createOrder.limit, RATE_LIMITS.createOrder.windowSecs);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const order = await getRazorpayClient().orders.create({
    amount: SERVICES.rewrite.pricePaise,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  });

  return NextResponse.json(
    {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
    { headers: rateLimitHeaders(rl) }
  );
}
