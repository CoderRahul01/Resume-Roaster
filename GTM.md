# Resume Roaster — Go-To-Market Plan
### Launch: TODAY | Budget: ₹0 | Goal: First 100 paying users

---

## The One-Line Pitch

> "Paste your resume. Get roasted by AI. Fix it for ₹499."

That's it. That's the hook. Don't dilute it.

---

## Who You're Targeting (Be Specific)

**Primary ICP (Ideal Customer Profile):**

Indian IT professionals, aged 22–35, earning ₹4–25 LPA, currently job hunting or quietly looking. They've applied to 20+ jobs, heard nothing back, and suspect their resume is the problem. They can't afford a career coach (₹10K+), but ₹499 feels like a fair bet.

**Secondary ICP:**

Software engineers in Tier-2 Indian cities (Coimbatore, Indore, Jaipur, Kochi) breaking into Bengaluru, Pune, or Hyderabad roles. More price-sensitive, less polished resume, higher urgency.

**International (stretch):**

US/UK-based job seekers who want brutal honest feedback and find "$5 one-time" ridiculously cheap compared to $49/month tools. Flip the pricing to $5 USD for this segment using geo-detection + Stripe (future).

---

## Channel Strategy — What To Do TODAY

### Channel 1: Reddit (Highest ROI, Zero Cost)

Reddit is where job seekers go to vent, ask, and find real tools. Competitors mostly ignore it. This is your moat.

**Action Plan:**

Post in these subreddits in this order:

- **r/resumes** — Your primary hunting ground. 2.4M members. Ask to roast a fake resume publicly, mention the tool.
- **r/cscareerquestions** — 2.1M members. Post a "What ATS actually looks for in 2026" thread and link your free roast.
- **r/india** + **r/developersIndia** — Targeted for the INR market.
- **r/jobs** — Broad, good for discovery posts.
- **r/ExperiencedDevs** — Senior engineers switching jobs, higher intent to pay.

**What to post (use these exact angles):**

1. *"I built an AI that roasts your resume like a senior hiring manager would. Free to try."* — Keep it humble, link in comments.
2. *"We analyzed 500 Indian developer resumes. Here's what ATS kills first."* — Make this a data post. Use your own roasting insights.
3. *"Roasted 3 resumes live — here's the unfiltered feedback [anonymized]"* — Screenshots with names blurred. Attach the tool link.

**Rule:** Never hard-sell. Be useful first. The tool sells itself if the roast is good.

---

### Channel 2: LinkedIn (India's Real Job Network)

90% of Indian white-collar job seekers are on LinkedIn. Recruiters are there too.

**Action Plan:**

Post 3× per week, short-form (no walls of text):

- "Your resume summary is probably killing your chances. Here's why." (Insight post with CTA at the end)
- Before/after resume screenshot posts (text-based, don't violate TOS)
- "I built a free resume roaster. DM me if you want your resume torn apart."

**Hashtags to use:** `#ResumeTips #JobSearch #HiringIndia #ITJobs #CareerAdvice #ATSOptimization`

**Engage with:** Career coaches' posts, recruitment agency content, "I'm open to work" posters. Be genuinely helpful in comments. This converts.

---

### Channel 3: WhatsApp Groups + Telegram Channels (India-Specific, Underused)

This is the channel everyone ignores and it's extremely high conversion for India.

- Search for placement cell WhatsApp groups (college alumni networks)
- Drop the tool link in developer Telegram channels: "t.me/IndianTechJobs", "t.me/ResumeHelp" etc.
- Ask 5 friends in job-hunting to share the free roast link in their WhatsApp circles

One good WhatsApp forward in a college alumni group = 50 users in one afternoon.

---

### Channel 4: Twitter/X (Viral Potential, Low Effort)

Job-seeking discourse on Twitter/X is high volume. Engage with:

- "#OpenToWork" posts — offer a free roast
- "#HiringNow" threads — contrast your brutal feedback with typical vague advice
- Trending resume templates (reply with your tool link)

Post short threads like: "5 resume mistakes I see in every Indian developer resume [Thread]"

---

### Channel 5: Product Hunt (One-Shot Launch Boost)

Schedule a Product Hunt launch for your first Monday after going live. This drives 200–500 visitors in 24 hours if done right.

**Tips for Product Hunt:**
- Launch at 12:01 AM PST (Tuesday or Wednesday, not Monday)
- Have 20+ supporters ready to upvote and comment (your LinkedIn/WhatsApp network)
- Tagline: "Your resume, brutally honest AI feedback, no fluff"
- First comment should explain the India-first pricing angle
- Offer 50 free rewrites to PH community (creates word of mouth)

---

### Channel 6: Hacker News (Show HN)

Post "Show HN: Resume Roaster — AI that gives brutally honest resume feedback (free)"

Keep it simple. Explain what it does, why you built it, what the free tier covers. HN readers are developers — they'll use it, share it, and write about it if it's genuinely useful. Expect 100–500 traffic from a good Show HN. Don't sell, show.

---

## Launch Day Checklist (Do This Today)

**Morning (Before You Post Anything):**

- [ ] Switch Razorpay from test keys to live keys in Railway env
- [ ] Set `NEXT_PUBLIC_BASE_URL` to your Railway domain in env vars
- [ ] Do one end-to-end test: paste resume → get roast → pay ₹499 → get rewrite
- [ ] Confirm `/api/health` returns `{ status: "ok" }`
- [ ] Test rate limiting works (5 roasts per IP per hour)

**Afternoon (Go Live):**

- [ ] Post on Reddit r/resumes (your best channel)
- [ ] Post on LinkedIn
- [ ] Share in your personal WhatsApp groups
- [ ] DM 10 friends: "Can you try this and tell me if it roasts your resume well?"

**Evening:**

- [ ] Check Railway logs for errors
- [ ] Check Redis for rate limiter activity (confirms real users)
- [ ] Screenshot first roast completions for social proof tomorrow

---

## First 30 Days — Week by Week

**Week 1 — Seed Users (Goal: 200 free roasts, 5 paying)**
- Manual outreach to college placement cells
- Post daily on Reddit, LinkedIn, Twitter
- Collect 10 testimonials from free users via DM

**Week 2 — Content Flywheel (Goal: 500 roasts, 15 paying)**
- Create "Top 10 worst resume mistakes I've seen this week" (use real anonymous data)
- Start a weekly email/LinkedIn newsletter: "Resume Red Flags of the Week"
- Post first before/after transformation (with user permission)

**Week 3 — Referrals (Goal: 1000 roasts, 30 paying)**
- Add a referral hook: "Share your roast score on LinkedIn/Twitter"
- Add a social share button after results ("I scored 4/10 on Resume Roaster 😬")
- A low score with a share button is viral. People share embarrassment.

**Week 4 — Optimize (Goal: 1500 roasts, 50 paying)**
- Review conversion funnel: Where do users drop off? Results page? Paywall?
- Adjust the roast tone if feedback says it's too harsh or too soft
- Engage with paying users: "What made you pay? What would you change?"

---

## Content That Will Drive Organic Traffic

These topics rank well on Google and get shared on Reddit:

- "How to beat ATS in 2026 — Indian developer edition"
- "Why your resume gets rejected in 30 seconds (and what to fix)"
- "Jobscan alternative: free ATS check for Indian job seekers"
- "Resume roasting: what a brutal AI hired at Google says about your resume"

Write 1 blog post per week. Host it on your domain. No extra cost. Pure SEO compounding.

---

## What NOT To Do (Common GTM Mistakes)

- **Don't pay for ads before you have organic traction.** Paid traffic without conversion-proven product = burning money.
- **Don't launch on multiple channels at once.** Pick Reddit + LinkedIn. Do them extremely well. Expand later.
- **Don't over-explain the AI.** Users care about results, not architecture.
- **Don't respond defensively to criticism.** Every harsh review on Reddit is a free product research session.
- **Don't wait for perfection.** The MVP is ready. Ship it.

---

## Metrics To Track (Week 1 Onwards)

| Metric | Week 1 Target | Month 1 Target |
|--------|--------------|----------------|
| Free roasts completed | 200 | 1,500 |
| Rewrite conversions | 5 | 50 |
| Revenue (₹) | 2,500 | 25,000 |
| Reddit upvotes on posts | 50+ | 500+ |
| LinkedIn post impressions | 1,000 | 10,000 |

Revenue at Month 1: **₹25,000 (~$300 USD).** That covers your Claude API + Railway + buffer.

---

## The Mindset Going In

You're not building a startup. You're building a cash-flowing product.

The goal is not to raise VC money. The goal is for ₹499 rewrites to pay for the Claude API calls that generate ₹499 rewrites. That's the loop. Every paying user validates the product and extends your runway.

Get the first 10 paying users before you add any new features. Ten paying users are worth more than 10,000 lines of new code.

---

*Last updated: March 2026 | Next review: After first 30 days live*