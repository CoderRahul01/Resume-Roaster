import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { updatePaymentStatus } from "@/services/db";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;
    const payment = event.payload?.payment?.entity;

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    switch (eventType) {
      case "payment.captured": {
        await updatePaymentStatus(
          payment.order_id,
          "CAPTURED",
          payment.id,
        );
        break;
      }
      case "payment.failed": {
        await updatePaymentStatus(payment.order_id, "FAILED");
        break;
      }
      case "refund.processed": {
        const refund = event.payload?.refund?.entity;
        if (refund && refund.payment_id) {
          // Update status to REFUNDED across any records linked to this payment ID
          await prisma.payment.updateMany({
            where: { razorpayPaymentId: refund.payment_id },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
