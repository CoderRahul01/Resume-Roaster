import { NextRequest, NextResponse } from "next/server";
import { parseCouponCodes } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code: unknown = body?.code;

    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ valid: false, message: "No coupon code provided." });
    }

    const coupons = parseCouponCodes();
    const upper = code.trim().toUpperCase();
    const discountPercent = coupons.get(upper);

    if (discountPercent === undefined) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code." });
    }

    return NextResponse.json({
      valid: true,
      code: upper,
      discountPercent,
      isFree: discountPercent === 100,
    });
  } catch {
    return NextResponse.json({ valid: false, message: "Failed to validate coupon." });
  }
}
