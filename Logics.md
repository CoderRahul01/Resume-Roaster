# Resume Roaster — User Flow & Redirect Logic
### Every Screen, Every State, Every Success & Failure

---

## Master Flow (Happy Path)

```
/ (Home)
  │
  └──► [User pastes resume] → clicks "ROAST ME"
         │
         ├── Loading state (RoastSkeleton × 6)
         │
         └──► /api/roast (POST)
                │
                ├── SUCCESS → Results appear on same page (/)
                │     │
                │     └──► [User sees score + 6 roast points + blurred rewrite]
                │             │
                │             └──► clicks "Get My Fixed Resume — ₹499"
                │                    │
                │                    └──► /api/create-order (POST)
                │                           │
                │                           └──► Razorpay modal opens (in-page)
                │                                  │
                │                                  ├── Payment SUCCESS
                │                                  │     │
                │                                  │     └──► sessionStorage ← paymentData
                │                                  │            │
                │                                  │            └──► navigate to /success
                │                                  │                   │
                │                                  │                   └──► /api/rewrite (POST)
                │                                  │                          │
                │                                  │                          ├── SUCCESS → rewritten resume displayed
                │                                  │                          └── FAIL → error state on /success
                │                                  │
                │                                  └── Payment CANCELLED / FAILED
                │                                        │
                │                                        └──► stays on / (home), modal closes, toast shown
                │
                └── FAIL → error toast on / (home), no navigation
```

---

## Screen-by-Screen Breakdown

---

### Screen 1: Home Page `/`

**What the user sees:**
A text area to paste their resume, a "ROAST ME" button, and a short one-liner explaining what the tool does.

**States on this screen:**

| State | What triggers it | What user sees |
|-------|-----------------|----------------|
| Default | Page loads | Empty textarea, "ROAST ME" button active |
| Loading | User clicks "ROAST ME" | Button disabled + spinner, 6 `RoastSkeleton` cards appear below |
| Success | `/api/roast` returns | 6 `RoastCard` components fade in with `animate-fade-in`, score displayed, blurred rewrite section appears below |
| Rate limited | 5 roasts/IP/hr exceeded | Toast: "You've hit the limit. Try again in an hour." Button re-enables after toast |
| API error | Claude fails / network error | Toast: "Something went wrong. Please try again." Button re-enables |
| Empty input | User clicks "ROAST ME" with blank textarea | Toast: "Paste your resume first." No API call made |
| Input too short | Under 100 characters | Toast: "Resume text is too short to roast." No API call made |

**After successful roast:**
The results render on the same page — no navigation. `roastData` and `resumeText` are written to `sessionStorage`. The page scrolls down to the results automatically.

---

### Screen 2: Results Section (inline on `/`)

**What the user sees:**
6 roast cards (emoji + title + description), overall score (e.g., "4/10 — Needs major work"), and below that a blurred `RewriteBlur` component with a `PaywallBanner` on top.

**States in this section:**

| State | What triggers it | What user sees |
|-------|-----------------|----------------|
| Roast loaded | After successful `/api/roast` | Cards + score visible, rewrite section blurred |
| Paywall CTA | Default | "Get My Fixed Resume — ₹499" button inside `PaywallBanner` |
| Order loading | User clicks CTA | Button text changes to "Creating order..." + spinner, button disabled |
| Order failed | `/api/create-order` fails | Toast: "Couldn't create payment. Try again." Button re-enables |
| Modal open | Order created successfully | Razorpay modal overlays the page (no navigation, no redirect) |

**Important:** The user never leaves `/` to pay. Razorpay modal is in-page. This is already how `PaywallBanner` works — don't change it.

---

### Screen 3: Razorpay Payment Modal (in-page overlay)

This is not a page you own — it's the Razorpay JS modal. But you control the callbacks.

**States and what happens after each:**

| Razorpay event | Handler | What happens next |
|----------------|---------|-------------------|
| `payment.success` | `onSuccess(response)` | Store `response` in `sessionStorage.paymentData` → `router.push('/success')` |
| `payment.failed` | `onError(error)` | Toast: "Payment failed. Your card was not charged." Modal closes, user stays on `/` |
| Modal dismissed (X button) | `onDismiss()` | Modal closes, user stays on `/`, no toast needed |
| Network timeout | `onError(error)` | Toast: "Payment timed out. Please try again." |

**sessionStorage written on success:**
```json
{
  "paymentData": {
    "razorpay_payment_id": "pay_xxx",
    "razorpay_order_id": "order_xxx",
    "razorpay_signature": "abc123..."
  }
}
```

`resumeText` must already be in sessionStorage from the roast step. If it's missing when the user lands on `/success`, they get the recovery flow (see below).

---

### Screen 4: Success Page `/success`

**What the user sees on arrival:**
A loading spinner while `/api/rewrite` is called. Then the full rewritten resume as plain text in a scrollable card. A "Copy to Clipboard" button. A "Roast another resume" button that goes back to `/`.

**States on this screen:**

| State | What triggers it | What user sees |
|-------|-----------------|----------------|
| Loading | Page mounts, calls `/api/rewrite` | Spinner + "Rewriting your resume..." text |
| Success | `/api/rewrite` returns rewritten text | Rewritten resume in a card, Copy button, Share score button |
| Missing sessionStorage | `paymentData` or `resumeText` is null | Recovery screen (see below) |
| Rewrite API failed | `/api/rewrite` returns error | Error state with retry button + support email |
| Invalid signature | HMAC mismatch in `/api/rewrite` | Error: "Payment could not be verified. Contact support." |
| Duplicate call blocked | `paymentData` already cleared on first load | Should not reach `/success` again — `paymentData` is cleared from sessionStorage after first successful rewrite call |

**After successful rewrite:**
Clear `paymentData` from sessionStorage immediately. Keep `resumeText` and `roastData` in sessionStorage (user might want to go back and check their original roast).

**"Copy to Clipboard" button behavior:**
Copy the rewritten text. Button text changes to "Copied ✓" for 2 seconds, then back to "Copy to Clipboard".

**"Roast Another Resume" button:**
Clears `resumeText` and `roastData` from sessionStorage. Navigates to `/`. The textarea is empty and ready for a new submission.

---

### Recovery Flow: Missing sessionStorage on `/success`

This happens when:
- User manually navigates to `/success` with no payment
- User refreshes `/success` after the rewrite already delivered (sessionStorage cleared)
- Tab was closed and reopened (sessionStorage gone)

**What to show:**

```
"Looks like you've already received your rewrite, or this session has expired."

[Button: "Go back to roast your resume →"]   → navigates to /
[Button: "Contact support"]                  → mailto:support@resumeroaster.in
```

Do NOT show an error. Do NOT say "payment not found." Frame it as session expiry — neutral, not alarming.

---

### Error Page `/error` (Optional but Recommended)

For unhandled edge cases — unexpected server crashes, Railway going down, etc. — have a minimal error page that doesn't expose internals.

**What to show:**
```
"Something went wrong on our end. Your payment (if any) is safe."

[Button: "Go back to home →"]        → navigates to /
[Button: "Check payment status"]     → links to dashboard.razorpay.com
```

This is a safety net. Users who paid and hit a crash need to know their money is safe. The Razorpay dashboard link lets them verify their payment independently.

---

## All Possible Redirects — Quick Reference

| From | To | Trigger | Condition |
|------|----|---------|-----------|
| `/` | `/success` | Payment modal success callback | `paymentData` stored in sessionStorage |
| `/success` | `/` | "Roast Another Resume" click | Always |
| `/success` | `/` | Missing sessionStorage on mount | `paymentData` or `resumeText` is null |
| `/success` | `/error` | Unhandled crash | Server 500 / network failure |
| Any page | `/` | User clicks logo/home | Always |

**What there are NO redirects for:**
- Payment failure — user stays on `/`, modal closes
- Rate limit hit — user stays on `/`, toast shown
- API error on roast — user stays on `/`, toast shown

The product never redirects users away from their current context unless a payment has succeeded. Every failure is handled in-place with a toast. This is intentional — redirecting on failure feels like the product is panicking. Staying put and showing a clear message feels calm and trustworthy.

---

## Toast Message Reference (All User-Facing Strings)

These are every message a user can see. Keep them short, honest, never technical.

| Scenario | Toast message | Type |
|----------|--------------|------|
| Resume too short | "Paste more of your resume — we need at least a few lines." | warning |
| Resume blank | "Your resume is empty. Paste it in and try again." | warning |
| Rate limited | "You've hit the hourly limit. Come back in an hour." | warning |
| Roast API error | "Something went wrong. Give it another shot." | error |
| Order creation failed | "Couldn't start payment. Try again in a moment." | error |
| Payment failed | "Payment didn't go through. Your card wasn't charged." | error |
| Payment timeout | "Payment timed out. You weren't charged — try again." | error |
| Rewrite API error | "Rewrite failed. Use the retry button below." | error |
| Signature invalid | "Payment couldn't be verified. Please contact support." | error |
| Copy success | "Copied to clipboard ✓" | success |

**Tone rule for all toasts:** No jargon, no blame, no panic. Short. Calm. Actionable.

---

## sessionStorage Keys — Full Reference

| Key | Value | Set when | Cleared when |
|-----|-------|----------|--------------|
| `resumeText` | Raw resume string | After successful roast on `/` | User clicks "Roast Another Resume" on `/success` |
| `roastData` | JSON-stringified `RoastResponse` | After successful roast on `/` | User clicks "Roast Another Resume" on `/success` |
| `paymentData` | JSON-stringified Razorpay response | After Razorpay `payment.success` callback | After first successful `/api/rewrite` call on `/success` |

**Critical rule:** `paymentData` must be cleared AFTER the rewrite is returned, not before. If you clear it before and the rewrite call fails, the user has no way to retry without paying again.

**Retry logic on `/success`:**
If `paymentData` is still in sessionStorage (meaning the previous rewrite attempt failed), show the retry button. The retry button calls `/api/rewrite` again with the same `paymentData`. The HMAC signature check is idempotent — same inputs always produce the same valid signature, so retrying with the same payment is safe.

---

## Add-On Flow (Cover Letter / LinkedIn — Month 3)

When you add the ₹199 cover letter upsell on `/success`, the flow extends like this:

```
/success (rewrite delivered)
  │
  └──► [User clicks "Add Cover Letter — ₹199"]
         │
         └──► Textarea appears: "Paste the job description"
                │
                └──► [User pastes JD] → clicks "Generate Cover Letter"
                       │
                       └──► /api/create-order (₹199 order)
                              │
                              └──► Razorpay modal (same in-page pattern)
                                     │
                                     └──► payment.success
                                            │
                                            └──► /api/cover-letter (POST, new route)
                                                   │
                                                   └──► Cover letter shown below rewrite on same page
```

Same security pattern: HMAC verify → Claude call → deliver. No new pages needed. Everything stays on `/success`.

---

*Last updated: March 2026 | Designed for Next.js App Router + Razorpay in-page modal*