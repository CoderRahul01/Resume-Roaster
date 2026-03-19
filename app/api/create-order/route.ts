import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const razorpay = getRazorpayClient();

    // ₹499 in paise
    const amount = 499 * 100;
    const currency = "INR";
    const receipt = `rcpt_${randomUUID().substring(0, 8)}`;

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Could not initiate payment. Please try again." },
      { status: 500 }
    );
  }
}
