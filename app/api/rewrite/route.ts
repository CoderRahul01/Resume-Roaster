import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { createHmac } from "crypto";
import { RATE_LIMITS, RESUME, SERVICES, ACTIVE_MODELS, FREE_MODE, parseCouponCodes } from "@/lib/config";
import { StructuredResume } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const rl = await checkRateLimit(ip, "rewrite", RATE_LIMITS.rewrite.limit, RATE_LIMITS.rewrite.windowSecs);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many rewrite requests. Please try again in an hour." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};
    const resumeText: unknown = body?.resumeText;
    const couponCode: string | undefined = typeof body?.couponCode === "string"
      ? body.couponCode.trim().toUpperCase()
      : undefined;

    if (typeof resumeText !== "string") {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }
    if (resumeText.length > RESUME.maxChars) {
      return NextResponse.json({ error: "Resume text is too long." }, { status: 400 });
    }

    // Check if this is a 100%-off coupon redemption
    const isCouponFree = (() => {
      if (!couponCode) return false;
      const pct = parseCouponCodes().get(couponCode);
      return pct === 100;
    })();

    if (!FREE_MODE && !isCouponFree) {
      // Require Razorpay payment fields and verify HMAC-SHA256 signature
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return NextResponse.json({ error: "Incomplete payment data." }, { status: 400 });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set");

      const generated_signature = createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Payment verification failed. If this is an error, contact support." },
          { status: 403 },
        );
      }
    }

    const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);

    const prompt = `You are a professional resume writer and ATS optimization expert.
Rewrite the resume below to be high-impact, ATS-friendly, and achievement-focused.

Rules:
1. Preserve every section that exists in the original (Summary, Experience, Education, Skills, Projects, etc.) — do NOT drop or merge sections.
2. Use strong action verbs (Spearheaded, Architected, Optimized, Engineered, etc.).
3. Quantify achievements wherever possible (e.g., "Reduced latency by 40%", "Grew revenue by ₹2M").
4. Keep the candidate's original information — only improve the language and structure.
5. Return ONLY a JSON object in the exact schema below. No extra text.

JSON schema:
{
  "name": "Full Name",
  "contact": "email · phone · linkedin (keep original, one line)",
  "sections": [
    {
      "heading": "SECTION HEADING IN CAPS",
      "text": "Use this field for free-text sections like Summary, Objective, Certifications, Skills"
    },
    {
      "heading": "WORK EXPERIENCE",
      "items": [
        {
          "title": "Job Title",
          "organization": "Company Name",
          "period": "Month Year – Month Year",
          "location": "City, Country (if present)",
          "bullets": [
            "Strong action-verb led bullet with metric...",
            "Another achievement bullet..."
          ]
        }
      ]
    }
  ]
}

Notes:
- Sections with a list of entries (Experience, Education, Projects) use "items".
- Sections with free text (Summary, Skills, Certifications) use "text".
- Keep all original sections from the resume; do not add new sections that weren't there.

Original resume:
---
${resumeForAI}
---`;

    const content = await callAI({
      model: ACTIVE_MODELS.rewrite,
      systemPrompt: "You are the Resume Roaster AI rewriter. You only speak in JSON.",
      userPrompt: prompt,
      maxTokens: SERVICES.rewrite.maxTokens,
    });

    // Strip markdown code fences if the model wraps response in ```json ... ```
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const raw = (fenceMatch ? fenceMatch[1] : content).trim();

    let structured: StructuredResume;
    try {
      structured = JSON.parse(raw);
    } catch {
      console.error("Rewrite API: AI returned invalid JSON:", raw);
      return NextResponse.json(
        { error: "The rewriter returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    // Reconstruct plain text from structured for copy-to-clipboard
    const plainLines: string[] = [structured.name, structured.contact, ""];
    for (const section of structured.sections) {
      plainLines.push(section.heading);
      if (section.text) {
        plainLines.push(section.text, "");
      } else if (section.items) {
        for (const item of section.items) {
          const header = [item.title, item.organization, item.period, item.location]
            .filter(Boolean)
            .join(" | ");
          plainLines.push(header);
          for (const b of item.bullets ?? []) plainLines.push(`• ${b}`);
          plainLines.push("");
        }
      }
    }

    return NextResponse.json(
      { rewrittenResume: plainLines.join("\n"), structured },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("Rewrite API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `The rewriter had a meltdown: ${message}` },
      { status: 500 }
    );
  }
}
