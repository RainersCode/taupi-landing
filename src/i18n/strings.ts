// Single source of truth for bilingual copy. LV is the primary market.
// Keep keys short and scoped by section.

export type Locale = "lv" | "en";

export const locales: Locale[] = ["lv", "en"];
export const defaultLocale: Locale = "lv";

type Dict = Record<string, string>;

export const strings: Record<Locale, Dict> = {
  lv: {
    "nav.features": "Iespējas",
    "nav.privacy": "Privātums",
    "nav.download": "Lejupielādēt",

    "hero.eyebrow": "Drīzumā App Store un Google Play",
    "hero.title": "Seko savām",
    "hero.title.italic": "finansēm",
    "hero.title.rest": "ikdienā.",
    "hero.sub": "Taupi ir dizainēts kā kluss, ikdienas pavadonis. Bez uzpūstiem grafikiem un tukšiem ieskatiem — tikai nauda un prāta miers.",
    "hero.cta.primary": "Lejupielādēt Taupi",
    "hero.cta.secondary": "Kā tas strādā",

    "waitlist.placeholder": "Tavs e-pasts",
    "waitlist.cta": "Pieteikties",
    "waitlist.done": "Esi sarakstā! Dosim ziņu, tiklīdz Taupi būs pieejams.",
    "waitlist.error": "Neizdevās pieteikties. Pamēģini vēlreiz pēc brīža.",
    "waitlist.note": "Bez surogātpasta — tikai viens e-pasts, kad lietotne būs klajā.",
    "nav.join": "Pieteikties",

    "reveal.eyebrow": "Lietotne",
    "reveal.title": "Mazāk domāšanas, vairāk kontroles.",
    "reveal.screens.dashboard.label": "Darījumi",
    "reveal.screens.dashboard.desc": "Katrs pirkums savā vietā — līdz pat čeka pozīcijām.",
    "reveal.screens.budget.label": "Budžets",
    "reveal.screens.budget.desc": "Alga, fiksētie, brīvā nauda — viens skaidrs plāns.",
    "reveal.screens.insights.label": "Ieskati",
    "reveal.screens.insights.desc": "Finansiālā veselība un prognoze, cik gadā uzkrāsi.",
    "reveal.screens.goals.label": "Kopskats",
    "reveal.screens.goals.desc": "Neto vērtība, konti un investīcijas vienuviet.",

    "features.eyebrow": "Iespējas",
    "features.ai.title": "AI ieskati",
    "features.ai.body": "Taupi seko taviem paradumiem un rāda finansiālās veselības skoru — ar prognozi, cik gadā uzkrāsi.",
    "features.scan.title": "Čeku skenēšana",
    "features.scan.body": "Nofotografē čeku — AI izlasa preces un saliek tās pa 23 kategorijām.",
    "features.trend.title": "Tēriņu analīze",
    "features.trend.body": "Dienas, nedēļas un mēneša ritms, lielākie tēriņi un tendences — vienā pieskārienā.",

    "lifestyle.eyebrow": "Ikdienā",
    "lifestyle.quote": "Pievienoju īri, rēķinus, abonementus — un redzu savu dienas budžetu. Vienkārši.",
    "lifestyle.attribution": "— Agrīnā lietotāja atsauksme",

    "trust.eyebrow": "Privātums",
    "trust.title.l1": "Privāti.",
    "trust.title.l2": "Punkts.",
    "trust.body": "Vienkārša lietotne. Vienkāršs solījums: tava nauda, tavi dati, tavas izvēles.",
    "trust.p1.title": "Glabāti Eiropas Savienībā",
    "trust.p1.detail": "eu-central-1",
    "trust.p2.title": "Šifrēti pārsūtē un krātuvē",
    "trust.p2.detail": "TLS 1.3 · AES-256",
    "trust.p3.title": "Nekādas reklāmas, nekādi sekotāji",
    "trust.p3.detail": "—",
    "trust.p4.title": "Eksportē vai dzēs datus jebkurā brīdī",
    "trust.p4.detail": "GDPR Art. 17 · 20",
    "trust.signature": "Darināts Latvijā. Atbildam uz katru e-pastu.",

    "cta.title": "Sāc šodien.",
    "cta.sub": "Bezmaksas lejupielāde. Strādā arī bez konta.",
    "cta.ios": "Lejupielādēt App Store",
    "cta.android": "Lejupielādēt Google Play",

    "footer.made": "Darināts Latvijā.",
    "footer.legal.privacy": "Privātuma politika",
    "footer.legal.terms": "Lietošanas noteikumi",
    "footer.legal.support": "Atbalsts",
  },

  en: {
    "nav.features": "Features",
    "nav.privacy": "Privacy",
    "nav.download": "Download",

    "hero.eyebrow": "Coming soon to the App Store and Google Play",
    "hero.title": "Track your",
    "hero.title.italic": "finances",
    "hero.title.rest": "every day.",
    "hero.sub": "Taupi is designed to be a quiet, everyday companion. No bloated charts, no empty insights — just your money, and some peace of mind.",
    "hero.cta.primary": "Download Taupi",
    "hero.cta.secondary": "How it works",

    "waitlist.placeholder": "Your email",
    "waitlist.cta": "Join waitlist",
    "waitlist.done": "You're on the list! We'll email you the moment Taupi launches.",
    "waitlist.error": "Couldn't sign you up. Please try again in a moment.",
    "waitlist.note": "No spam — a single email when the app goes live.",
    "nav.join": "Join waitlist",

    "reveal.eyebrow": "The app",
    "reveal.title": "Less thinking, more control.",
    "reveal.screens.dashboard.label": "Transactions",
    "reveal.screens.dashboard.desc": "Every purchase in its place — down to receipt items.",
    "reveal.screens.budget.label": "Budget",
    "reveal.screens.budget.desc": "Salary, fixed costs, free money — one clear plan.",
    "reveal.screens.insights.label": "Insights",
    "reveal.screens.insights.desc": "Financial health and a projection of your year's savings.",
    "reveal.screens.goals.label": "Overview",
    "reveal.screens.goals.desc": "Net worth, accounts and investments in one place.",

    "features.eyebrow": "Features",
    "features.ai.title": "AI insights",
    "features.ai.body": "Taupi follows your habits and shows a financial health score — with a projection of what you'll save in a year.",
    "features.scan.title": "Receipt scan",
    "features.scan.body": "Photograph a receipt — AI reads the items and sorts them into 23 categories.",
    "features.trend.title": "Spending analysis",
    "features.trend.body": "Daily, weekly and monthly rhythm, biggest expenses and trends — in one tap.",

    "lifestyle.eyebrow": "Every day",
    "lifestyle.quote": "I added rent, bills, subscriptions — and I see my daily budget. Simple.",
    "lifestyle.attribution": "— Early tester",

    "trust.eyebrow": "Privacy",
    "trust.title.l1": "Private.",
    "trust.title.l2": "Period.",
    "trust.body": "A simple app. A simple promise: your money, your data, your choices.",
    "trust.p1.title": "Hosted in the European Union",
    "trust.p1.detail": "eu-central-1",
    "trust.p2.title": "Encrypted in transit and at rest",
    "trust.p2.detail": "TLS 1.3 · AES-256",
    "trust.p3.title": "No ads, no trackers",
    "trust.p3.detail": "—",
    "trust.p4.title": "Export or delete your data anytime",
    "trust.p4.detail": "GDPR Art. 17 · 20",
    "trust.signature": "Built in Latvia. We reply to every email.",

    "cta.title": "Start today.",
    "cta.sub": "Free to download. Works without an account.",
    "cta.ios": "Download on the App Store",
    "cta.android": "Get it on Google Play",

    "footer.made": "Made in Latvia.",
    "footer.legal.privacy": "Privacy Policy",
    "footer.legal.terms": "Terms of Service",
    "footer.legal.support": "Support",
  },
};

export function getDict(locale: Locale): Dict {
  return strings[locale] ?? strings[defaultLocale];
}
