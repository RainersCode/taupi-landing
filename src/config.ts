/**
 * Launch-day switch. While `live` is false the site runs in pre-launch mode:
 * waitlist forms + tester offer. On release day set `live: true`, paste the
 * two store URLs, and deploy — Hero + CTA swap to download badges and the
 * SoftwareApplication schema goes live for Google.
 */
export const launch = {
  live: false,
  appStoreUrl: "",
  playStoreUrl: "",
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
