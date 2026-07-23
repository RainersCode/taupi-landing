export const config = { runtime: "edge" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The Supabase project URL is public (every app client ships it) — only the
// service key is a secret and must come from the environment.
const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://gfgpsuwqtplvbxtxhdsw.supabase.co";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let body: { email?: string; locale?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false }, 400);
  }

  // Honeypot filled → a bot; pretend success so it stops retrying.
  if (body.website) return json({ ok: true });

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ ok: false }, 400);
  const locale = body.locale === "en" ? "en" : "lv";

  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      // Duplicate email → no error, signup stays idempotent.
      Prefer: "resolution=ignore-duplicates",
    },
    body: JSON.stringify({ email, locale, source: "landing" }),
  });

  if (!res.ok && res.status !== 409) return json({ ok: false }, 502);
  return json({ ok: true });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
