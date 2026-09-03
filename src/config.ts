/**
 * Launch-day switch. While `live` is false the site runs in pre-launch mode:
 * waitlist forms + tester offer. On release day set `live: true`, paste the
 * two store URLs, and deploy — Hero + CTA swap to download badges and the
 * SoftwareApplication schema goes live for Google.
 */
export const launch = {
  live: true,
  appStoreUrl: "https://apps.apple.com/app/id6763491623",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.rainerslovkins.taupi",
};

/**
 * The human behind the financial content.
 *
 * Personal finance is a YMYL ("your money or your life") topic — Google
 * weighs it against who is saying it, and content attributed to a faceless
 * Organization is discounted against banks that name an author. This entity
 * is emitted as schema.org `Person` and referenced as `author` from every
 * Article / BlogPosting.
 *
 * TODO before this earns anything: fill `jobTitle`, `bio` and at least one
 * `sameAs` profile (LinkedIn is the one Google actually resolves). An author
 * with no verifiable footprint is a weaker signal than a good one — but it is
 * still stronger than the Organization fallback we had. Leave `name` empty to
 * fall back to the Organization entity entirely.
 */
export const author = {
  name: "Rainers Lovkins",
  /** Rendered in the author box and JSON-LD. */
  jobTitle: "Taupi dibinātājs un izstrādātājs",
  /** One or two sentences of relevant background. Empty hides the box's
      body — a byline with no substance is not worth the space.

      Leads with what it is NOT: on YMYL finance content an honest
      disclaimer plus real lived experience reads as more trustworthy than
      a vague authority claim, and Google's "Experience" criterion is
      exactly this — the person had the problem and solved it. */
  bio:
    "Neesmu finanšu konsultants. Taupi sāku būvēt tāpēc, ka pirms hipotekārā kredīta mājas būvniecībai vajadzēja nomaksāt auto patēriņa kredītu — un gribēju precīzi zināt, cik dienā varu atļauties tērēt. Rīki un aprēķini šajā vietnē ir tie paši, ko izmantoju pats.",
  /** Profile URLs Google can cross-reference — LinkedIn first. Rendered as
      links in the author box and emitted as schema.org sameAs. */
  sameAs: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rainers-lovkins-2a3b531a7/" },
  ] as { label: string; href: string }[],
  /** Optional headshot in /public (e.g. "/author.jpg"). Falls back to a
      monogram rather than a stock avatar. */
  photo: "",
};

/**
 * Official social profiles. Emitted as `sameAs` in the Organization JSON-LD
 * (Seo.astro) so Google can connect the profiles to the brand, and rendered
 * as icon links in the footer (Footer.astro — icon per `label`).
 */
export const socials: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/taupi.eu/" },
  { label: "TikTok", href: "https://www.tiktok.com/@taupi.eu" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61592745180170" },
  { label: "Threads", href: "https://www.threads.com/@taupi.eu" },
  { label: "X", href: "https://x.com/taupiapp" },
];
