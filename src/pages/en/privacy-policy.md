---
layout: "~/layouts/Legal.astro"
title: "Privacy Policy"
description: "How Taupi collects, uses and protects your data — EU data storage, encryption, your GDPR rights and how to reach us with questions."
updated: "2026-05-08"
version: "2.1"
locale: "en"
---

## 1. Who we are

Taupi ("we", "us", "the app") is a personal budgeting and expense-tracking app operated by taupi.eu.

- **Contact:** info@taupi.eu

We are the **data controller** for the personal data we process about you. If you want to exercise any of the rights described below, or you have questions about this policy, email the address above.

## 2. What data we collect

We keep the collection deliberately small.

### Data you provide when you create an account
- **Email address** — used for sign-in and password reset.
- **Password** — stored only as a salted hash by our authentication provider (Supabase Auth). We never see your plaintext password.
- **OAuth identifier** (optional) — if you sign in with Google, Apple, or Facebook, we receive a stable user ID and your email from that provider. We do **not** request access to your contacts, calendar, posts, or any other data from those providers.

### Data you enter while using the app
- Monthly income, fixed costs, expenses, investments, long-term goals, and notes you attach to entries.
- Profile signals used to tailor AI insights: age range, household size, city, and your primary financial goal. These are optional.

### Data from receipt scanning (only if you use it)
- **Receipt images** you photograph or upload for OCR.
- **Extracted line items, totals, and store name** parsed from those receipts.
- Images are transmitted to our receipt-parsing service and to Anthropic's Claude API for text extraction; **we do not retain the image after parsing is complete**.

### Technical data
- **Device/platform identifiers** supplied by the OS (iOS / Android version, device model) — used only for crash triage and push-notification routing, never for advertising.
- **IP address** — used by our API backend for abuse prevention and rate limiting; retained in logs for up to 14 days.
- **Push notification token** (if you enable notifications) — routed through Expo's push service.

### Anonymous community price data (only if you opt in)
If you enable "Share prices anonymously" in Settings, scanned receipt line items — **store, item name, price, date** — are added to a shared catalogue so other users can see prices at different stores. **No user ID, email, device ID, or location is attached.** You can turn this off at any time; already-contributed rows stay in the catalogue because they are no longer linkable to you.

### What we do NOT collect
- Bank account credentials or transactions. We never connect to your bank.
- Location (GPS) data.
- Contacts, calendar, SMS, or photo library beyond the specific images you hand to the receipt scanner.
- Advertising IDs (IDFA / GAID).
- Analytics about how you use individual screens.

## 3. Why we process your data (purposes and legal basis)

| Purpose | Data used | Legal basis (GDPR Art. 6) |
|---|---|---|
| Create and secure your account | email, password hash, OAuth ID | Contract (Art. 6(1)(b)) |
| Show you your own financial entries | entries you created | Contract (Art. 6(1)(b)) |
| Generate AI insights and summaries | entries + profile signals | Legitimate interest (Art. 6(1)(f)) — providing the core product you signed up for |
| Parse receipt images | image sent to AI provider | Contract (Art. 6(1)(b)) — you initiated the scan |
| Send you push notifications (daily reminder, weekly summary) | push token + entry data | Consent (Art. 6(1)(a)) — you enable this in Settings |
| Contribute to the anonymous price catalogue | item / store / price (no user ID) | Consent (Art. 6(1)(a)) |
| Abuse prevention and security | IP + request metadata | Legitimate interest (Art. 6(1)(f)) |
| Respond to legal requests | whatever is necessary | Legal obligation (Art. 6(1)(c)) |

You can withdraw consent at any time (for push / price-sharing) in Settings. Withdrawal does not affect processing that already happened.

## 4. Who processes your data on our behalf (subprocessors)

We use the following service providers ("processors"). They process data only on our instructions.

| Provider | What they do | Location | Safeguard |
|---|---|---|---|
| **Supabase** (Supabase, Inc.) | Database + authentication | EU (Frankfurt) | Data Processing Agreement; EU-hosted |
| **Anthropic** (Anthropic PBC) | Claude LLM for receipt OCR and insights | United States | Standard Contractual Clauses; API data not used to train models per Anthropic's commercial policy |
| **Vercel** (Vercel Inc.) | Hosts our API endpoints (receipt OCR proxy, insights proxy) | United States / EU | Standard Contractual Clauses |
| **Apple Inc.** | "Sign in with Apple" identity service | Ireland / United States | Apple's own controller/processor terms |
| **Google LLC** | "Sign in with Google" identity service | Ireland / United States | Google's own controller/processor terms |
| **Meta Platforms Ireland Ltd.** | "Sign in with Facebook" identity service | Ireland / United States | Meta's own terms |
| **Expo, Inc.** | Push notification token routing (to APNs / FCM) | United States | Standard Contractual Clauses |

If we add or change a subprocessor that meaningfully affects your data, we will update this page and bump the version number at the top.

## 5. International transfers

Your primary data (account, entries, receipts-in-flight) is stored in the **European Union** (Supabase Frankfurt). When we send data outside the EU — for example, a receipt image to Anthropic for OCR, or a push token through Expo — we rely on the **EU Standard Contractual Clauses** approved by the European Commission to protect your data.

## 6. How long we keep your data

| Data | Retention |
|---|---|
| Account + financial entries | Kept while your account exists. Deleted within **30 days** of account deletion. |
| Supabase database backups | Rotated out within **90 days** of deletion. |
| Receipt images sent to AI | **Not retained** — discarded immediately after parsing. |
| API / abuse-prevention logs | **14 days** rolling. |
| Anonymous price-catalogue rows | Retained indefinitely in de-identified form (not linkable to you). |
| Customer-support emails | **24 months** from last correspondence. |

## 7. How we protect your data

- Traffic is encrypted in transit (HTTPS / TLS 1.2+).
- Data at rest is encrypted by Supabase.
- Row-Level Security (RLS) in the database means only your authenticated account can read or write your rows, enforced at the query layer.
- Our API endpoints are rate-limited and require an app secret; they cannot be called anonymously from a browser.

No system is 100 % secure. If we ever experience a data breach affecting your personal data, we will notify you and the supervisory authority within 72 hours as required by GDPR Art. 33–34.

## 8. Your rights

Under the GDPR you have the right to:

- **Access** — get a copy of the data we hold about you (Art. 15).
- **Rectification** — correct inaccurate data (Art. 16).
- **Erasure** — delete your account and all associated data (Art. 17). Tap Settings → Delete Account, or email us.
- **Restriction** — ask us to pause processing (Art. 18).
- **Portability** — get your data in a machine-readable format (Art. 20). Tap Settings → Export CSV, or email us for a JSON export.
- **Object** — to processing based on legitimate interest (Art. 21).
- **Withdraw consent** — for push notifications or price sharing, in Settings.
- **Not be subject to a decision based solely on automated processing** (Art. 22). Our AI features are informational; they never deny you a financial product or service.

To exercise any right, email **info@taupi.eu**. We respond within 30 days.

If you think we are mishandling your data, you can lodge a complaint with the **Latvian Data State Inspectorate** (*Datu valsts inspekcija*) — Elijas iela 17, Rīga, LV-1050, [dvi.gov.lv](https://www.dvi.gov.lv) — or with your local EU data protection authority.

## 9. AI features — what leaves your device

When you use **AI insights** or **receipt scanning**:

- The relevant data (your entries summary, or the receipt image) is sent from your device to our API backend (hosted on Vercel), which forwards it to **Anthropic's Claude API** over TLS.
- Anthropic processes the request and returns a result. Under Anthropic's commercial API terms, **your data is not used to train their models** and is retained by them only for a short window for operational and abuse-prevention purposes (see Anthropic's own policy at [anthropic.com/privacy](https://www.anthropic.com/privacy)).
- The AI output is informational only — it is **not financial, tax, investment, or legal advice**. See the Terms of Service for more.
- We recommend you do not put anything you would not want a third-party service to see (e.g. ID numbers, medical info) into free-text fields in the app.

## 10. Children

Taupi is not directed at children under 16 (EU) or 13 (United States). We do not knowingly collect data from children. If you believe a child has created an account, email us and we will delete it.

## 11. Cookies, tracking, analytics

We do **not** run any analytics, ad network, tracking pixel, or cross-app identifier. The app does not use cookies. iOS App Tracking Transparency is not applicable because we do not track you across other companies' apps or sites.

## 12. Changes to this policy

When we change this policy we will:

1. Bump the version and "Last updated" date at the top.
2. Show an in-app notice the next time you open the app if the change is material.

Superseded versions are kept in Git history in our public repository for transparency.

## 13. Contact

- Email: **info@taupi.eu**
