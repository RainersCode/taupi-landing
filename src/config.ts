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
