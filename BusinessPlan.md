# Resume Roaster — Business & Pitch Plan
### Revenue Model | Growth Strategy | How To Find & Win Users

---

## What This Product Actually Is

Resume Roaster is a **zero-setup SaaS tool** with a brutally simple model: users get a free AI critique of their resume, and pay ₹499 one time to receive an AI-rewritten, ATS-optimized version. No subscriptions. No accounts. No friction.

The business case is straightforward. Resume building tools is a **$1.57B market growing at 9.3% CAGR**. India alone has 1.8M+ IT job openings every year and a massive skill-credentialing gap. Most tools are US-centric, priced in USD, and locked behind monthly subscriptions. Resume Roaster is India-first, one-time payment, and honest in a way that competitors aren't.

---

## Revenue Model (Current)

**Free Tier:** AI roasting (6 critique points + score out of 10). No login. No credit card. Just paste resume and get roasted. This is the acquisition engine.

**Paid Tier:** One-time ₹499 payment → AI rewrites the resume preserving the original format, improving content for ATS and modern hiring standards. Delivered instantly. No follow-ups needed.

**Unit Economics:**

| Item | Cost/Revenue |
|------|-------------|
| One roast (Claude API) | ~₹0.25 (fractions of a cent) |
| One rewrite (Claude API) | ~₹1.00 |
| Razorpay transaction fee | 2% + ₹3 = ~₹13 per ₹499 |
| Net revenue per rewrite | **~₹486** |
| Break-even (Railway + Redis) | ~7 rewrites/month |

With 50 rewrites/month, you're at **₹24,300 net** after fees. That's month 1 profitability, not month 12.

---

## Revenue Roadmap — 3 Tiers of Growth

### Tier 1: Bootstrap (Month 1–3) — Current State

- Free roasting drives traffic
- ₹499 one-time rewrites are the only revenue
- Target: 50–100 rewrites/month = ₹25K–50K/month

**What to do:** Do nothing new. Get traffic. Watch conversions. Improve the prompt.

---

### Tier 2: Expand Revenue Streams (Month 3–6)

Once you have 200+ daily users, layer in:

**LinkedIn Optimizer (₹299 add-on)**
Pull the same resume and rewrite it specifically for LinkedIn's algorithm — summary, headline, experience bullets, skills section. Different from resume format. Priced lower because it's a smaller deliverable but high perceived value.

**Cover Letter Generator (₹199 add-on)**
After the rewrite, offer a matching cover letter for the specific role they're applying to. Ask for the job description URL or paste. One additional Claude call. 40% of paying users will add this. Upsell on the `/success` page.

**"Roast vs. Rewrite" API for Placement Cells (B2B, ₹5,000–20,000/month)**
College placement cells need to prep 200–500 students per semester. Offer bulk access — placement officers get a dashboard where students submit resumes, all get roasted, reports go to the coordinator. No dev work needed to start: do it manually with email + Google Sheet first, validate demand, then automate.

---

### Tier 3: Scale (Month 6–12)

**International Pricing (USD track)**
Add Stripe (already in package.json, credentials in .env). Geo-detect non-India users. Charge $5 USD for rewrite instead of ₹499. At $5 per rewrite, the same product is 8x cheaper than US competitors. No marketing budget needed — the price differential is the marketing.

**ATS Job Match Score (₹199/scan)**
User pastes resume + job description. AI scores the match % and tells them exactly what to add/remove. This is what Jobscan charges $50/month for. You can do it per-scan for ₹199.

**Resume Subscription (₹999/month)**
Unlimited roasts + 3 rewrites/month + LinkedIn optimization. For active job seekers who apply to 10+ roles simultaneously. Predictable recurring revenue. Sell this only after you have 500+ monthly active users.

---

## How to Find Clients (Distribution Channels)

### Individual Users — The Reddit Playbook

Reddit is the highest ROI channel for zero-budget. The key insight is that job seekers on Reddit are actively looking for solutions. They're not browsing — they're desperate. Your tool is exactly what they need.

Post a genuine roast of a fake/anonymized resume in r/resumes. Be honest, be specific, be helpful. At the end, mention "I built a tool that does this automatically." That single post can drive 200–500 visitors.

Follow up with data posts: "I roasted 200 resumes this month. These are the 7 most common mistakes." This is infinitely shareable. Subreddits to target: r/resumes, r/cscareerquestions, r/jobs, r/developersIndia, r/india.

### B2B — Placement Cells and Career Services

This is untapped. Every engineering college in India (3,000+ of them) runs a placement cell. These coordinators have 200–500 students submitting mediocre resumes every semester, and the coordinator personally reviews them. That's 200–500 resumes reviewed by one tired human.

Your pitch to them is simple: "Give your students AI-powered resume feedback before you submit them to companies. ₹5,000/semester for unlimited student roasts."

**How to reach them:** Email the placement officer directly. Find their email on the college website. Write one sentence: "I built a tool that roasts student resumes with AI. Can I show you a 5-minute demo? It's free to try." Don't pitch. Don't sell. Demo it.

### Freelancers and Consultants on LinkedIn

Career coaches charge ₹5,000–15,000 for a resume review session. You can offer them a white-label version: they use your tool + add their own advice on top. Their clients get AI + human feedback. You charge the coach ₹999/month for access. The coach charges the client ₹3,000. Everyone wins.

Post on LinkedIn: "Attention career coaches — I built an AI resume roaster. I want to give 10 coaches free access in exchange for feedback." You'll get 30 responses the first day.

### Bootcamp Alumni Networks

Coding bootcamp alumni groups (Masai School, Newton School, Scaler, GUVI, Coding Ninjas alumni communities) are full of people actively job hunting with mediocre resumes. These communities are tight-knit and share useful tools aggressively.

Post in Masai School Discord, Scaler alumni Telegram, Newton School WhatsApp groups. One authentic share from an alumnus carries more weight than 100 paid ads.

---

## The Client Pitch (For B2B)

When talking to placement officers, HR consultants, or bootcamp operators, this is your pitch structure:

**Problem Statement:** "Your students/candidates apply to companies with resumes that get rejected in 30 seconds by ATS software. You review them manually, which takes hours. Companies reject candidates before a human ever reads the resume."

**Solution:** "Resume Roaster is an AI that does what a senior recruiter would do in a 30-minute resume review — in 10 seconds. For free. If they want the rewritten version, it's ₹499. For placement cells, I offer bulk access at a flat monthly rate."

**Social Proof (Use as Soon As You Have It):** "1,000 resumes roasted in the first month. Average score improvement after rewrite: 4.2 to 7.8 out of 10."

**Ask:** "Can I give your team free access for 30 days? No commitment. I just want your feedback."

Never lead with price. Lead with the free trial. Price comes after they see value.

---

## Competitive Positioning

You are not competing with Jobscan or Resume Worded on features. You are winning on price, speed, and honesty.

**Against Jobscan ($50/month):** You're one-time ₹499. For someone applying to jobs for one month, your product costs 1/10th of theirs. Position as "the Jobscan for people who don't want a subscription."

**Against Resume Worded ($49/month):** Similar. Add that your roast is more honest and less corporate than their feedback.

**Against LinkedIn Premium (₹2,700/month):** You do one thing they do — resume feedback — but do it better, faster, and for a fraction of the cost.

**Against freelance resume writers (₹2,000–10,000 per resume):** You're 4x–20x cheaper, instant, and available at 3am when they're anxious about an application.

---

## Budget Allocation (Zero Cash Available)

You have five assets right now:

**$5 Claude API credits** — enough for ~500 roasts and ~125 rewrites at current prices. This is your runway. Spend it only on actual user traffic.

**$1,000 Google Cloud credits** — Use for Cloud Run (hosting a PDF parsing microservice later), Cloud Storage (storing uploaded PDFs if you add file upload), and Vertex AI (Gemini 1.5 Flash as a cheaper fallback LLM when Claude credits run out). Do not touch these for anything except infrastructure.

**Railway Pro ($5/month plan)** — Already covers your Next.js deployment and Redis. No changes needed.

**ChatGPT Pro (no API)** — Use it for writing Reddit posts, LinkedIn content, email drafts, and pitch scripts. Don't try to use it for your product's backend. It's your marketing assistant.

**Your time** — This is the most valuable and most scarce resource. Spend it on distribution first, not new features. Every hour coding something new is an hour not spent getting users.

---

## Financial Projections (Conservative)

These numbers assume zero paid advertising and organic-only growth.

| Month | Daily Users | Roasts | Rewrites (5%) | Revenue |
|-------|------------|--------|---------------|---------|
| 1 | 50 | 1,500 | 75 | ₹36,750 |
| 2 | 100 | 3,000 | 150 | ₹73,500 |
| 3 | 200 | 6,000 | 300 | ₹1,47,000 |
| 6 | 500 | 15,000 | 750 | ₹3,67,500 |
| 12 | 1,000 | 30,000 | 1,500 | ₹7,35,000 |

At Month 3, you have enough revenue to cover costs, pay yourself a small amount, and invest in one paid channel experiment. At Month 6, this is a sustainable side income. At Month 12, this is a full-time product.

**Key assumption:** 5% of free roasters pay for rewrite. This is conservative. Industry average for freemium → paid conversion in single-use tools is 3–8%.

---

## The Flywheel That Makes This Work

Free roast → user gets honest feedback → sees how bad their resume is → emotional moment ("oh no, my resume is a 3/10") → social share (embarrassment + curiosity is viral) → new users arrive → some pay for rewrite → revenue funds API costs → more roasts possible.

The viral loop is the low score. A 3/10 roast score is embarrassing and shareable. Add a "Share my roast score" button on the results page. This costs you nothing and creates organic referral traffic.

---

## What Success Looks Like (6-Month Mark)

At the 6-month mark, a successful outcome looks like:

- 10,000+ resumes roasted total
- 500+ paid rewrites
- 3 placement cell partnerships generating recurring B2B revenue
- ₹2–3 lakh/month in gross revenue
- Product running autonomously with minimal maintenance

This is not a unicorn. This is a real, self-sustaining product that generates cash, validates your ability to build and distribute, and gives you the credibility and capital to build version 2.

---

*Last updated: March 2026 | Built for zero-budget launch*