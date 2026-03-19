import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { createHmac } from "crypto";
import { RewriteResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { 
      resumeText, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = await req.json();

    if (!resumeText || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Incomplete payment data." },
        { status: 400 }
      );
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set");

    const generated_signature = createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. If this is an error, contact support." },
        { status: 403 }
      );
    }

    const anthropic = getAnthropicClient();
    
    const prompt = `You are a professional resume writer and ATS optimization expert. 
Your goal is to rewrite the provided resume to make it professional, high-impact, and ATS-friendly.

Guidelines:
1. Preserve the original section structure (Summary, Experience, Skills, etc.).
2. Use strong action verbs (e.g., "Spearheaded", "Engineered", "Optimized").
3. Quantify achievements where possible (e.g., "Reduced latency by 40%", "Increased sales by ₹2M").
4. Ensure keyword density for a modern IT/Tech job market.
5. Keep the tone professional, confident, and concise.
6. Return only the rewritten text, formatted clearly with Markdown-style headings if appropriate, but keeping it as a plain text block that can be copied.

Return ONLY a JSON response in the following format:
{
  "rewrittenResume": "string"
}

Here is the original resume text:
---
${resumeText}
---`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      system: "You are the Resume Roaster AI. You only speak in JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    const rewriteData: RewriteResponse = JSON.parse(content);

    return NextResponse.json(rewriteData);
  } catch (error) {
    console.error("Rewrite API Error:", error);
    return NextResponse.json(
      { error: "The rewriter had a meltdown. Please try again." },
      { status: 500 }
    );
  }
}
