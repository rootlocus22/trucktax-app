# Email auto-triggers

Quick reference: where each automated email is triggered in the product.

---

## Welcome email

**When:** Once per user, on **fresh signup** or **first-time user record creation**.

**Trigger locations:**

| Trigger | File | What happens |
|--------|------|----------------|
| Email/password signup | `contexts/AuthContext.js` → `signUp()` | After `createUser()` in Firestore, calls `POST /api/email/welcome`. |
| Google sign-in (new user) | `contexts/AuthContext.js` → `signInWithGoogle()` | When `getUser(uid)` is null, creates user then calls `POST /api/email/welcome`. |
| First load / auth restore (no Firestore doc) | `contexts/AuthContext.js` → `onAuthStateChanged` | When `getUser(uid)` is null, creates user doc then calls `POST /api/email/welcome`. |

**API:** `app/api/email/welcome/route.js`  
- Sends only if `!userData?.welcomeEmailSentAt`.  
- After sending, sets `welcomeEmailSentAt` on the user doc (so it never sends twice).

**Not sent:** On normal login (returning user who already has a user doc). Only on signup or when a new user record is created.

---

## Thank you (post payment)

**When:** Right after a **successful UCR certificate payment** (Stripe).

**Trigger location:**

| Trigger | File | What happens |
|--------|------|----------------|
| Stripe payment success | `app/api/webhooks/stripe/route.js` | On `payment_intent.succeeded` or `checkout.session.completed`, calls `sendInvoiceEmail()`. |

**Inside `sendInvoiceEmail()`:**

1. Sends **invoice email** (amount, filing ID, legal name).
2. Sends **thank you email** (post-download / “Thank you for choosing QuickTruckTax”) to the same recipient.

**Condition:** Currently runs when amount is $79 (e.g. `amount === 7900` or `amountTotal === 7900`). If you add other payment amounts, consider calling the thank-you send for those too.

---

## UCR filing status emails (submitted / processing / certificate ready)

**When:** As the UCR filing moves through your workflow.

| Email | Trigger location | When |
|-------|------------------|------|
| **Submitted** | `app/ucr/file/page.js` | When user submits the UCR form (after govt fee paid). |
| **Processing** | `app/agent/page.js` | When agent marks filing as “processing”. |
| **Certificate ready (pay & download)** | `app/agent/filings/[id]/page.js` and `app/agent/page.js` | When agent marks filing as “completed”. |

All use `POST /api/email/filing-status` with `{ filingId, status }` (`submitted` | `processing` | `completed`).

---

## Abandon UCR (cart recovery)

**When:** Cron job finds UCR visits that were abandoned (e.g. left without completing).

**Trigger:** `GET /api/cron/ucr-abandon-emails` (e.g. Vercel Cron).  
Sends to addresses in `ucr_visits` where `abandonedAt` is past threshold and `abandonEmailSent` is not set.

---

## Summary

| Email | Auto? | Trigger |
|-------|-------|--------|
| Welcome | Yes | Signup / first-time user creation (AuthContext + `/api/email/welcome`) |
| Thank you (post payment) | Yes | Stripe webhook after UCR payment (`sendInvoiceEmail`) |
| Invoice | Yes | Same Stripe webhook |
| Filing submitted | Yes | UCR file page on submit |
| Filing processing | Yes | Agent marks processing |
| Certificate ready | Yes | Agent marks completed |
| Abandon UCR | Yes | Cron `/api/cron/ucr-abandon-emails` |
