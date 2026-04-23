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

    "hero.eyebrow": "Personīgo izdevumu sekošana",
    "hero.title": "Zini, kur",
    "hero.title.italic": "aiziet",
    "hero.title.rest": "tava nauda.",
    "hero.sub": "Taupi ir dizainēts kā kluss, ikdienas pavadonis. Bez uzpūstiem grafikiem un tukšiem ieskatiem — tikai nauda un prāta miers.",
    "hero.cta.primary": "Lejupielādēt Taupi",
    "hero.cta.secondary": "Kā tas strādā",

    "reveal.eyebrow": "Lietotne",
    "reveal.title": "Mazāk domāšanas, vairāk kontroles.",
    "reveal.screens.dashboard.label": "Sākums",
    "reveal.screens.dashboard.desc": "Viens skaitlis. Cik drīksti šodien tērēt.",
    "reveal.screens.budget.label": "Budžets",
    "reveal.screens.budget.desc": "Redzi, kur aizies tava alga.",
    "reveal.screens.insights.label": "AI ieskati",
    "reveal.screens.insights.desc": "AI pamana to, ko tu nepamani.",
    "reveal.screens.goals.label": "Mērķi",
    "reveal.screens.goals.desc": "Mazi limiti. Lieli uzkrājumi.",

    "features.eyebrow": "Iespējas",
    "features.ai.title": "AI ieskati",
    "features.ai.body": "Katru nedēļu Taupi paskatās uz taviem paradumiem un pastāsta, kas mainās.",
    "features.scan.title": "Čeku skenēšana",
    "features.scan.body": "Nofotografē čeku. Taupi izlasa preces, cenas un kategorijas.",
    "features.trend.title": "Tēriņu analīze",
    "features.trend.body": "Redzi ikdienas, nedēļas un mēneša ritmu ar vienu pieskārienu.",

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
    "trust.signature": "Viens izstrādātājs Latvijā. Atbildu uz e-pastu pats.",

    "cta.title": "Sāc šodien.",
    "cta.sub": "Bezmaksas lejupielāde. Strādā arī bez konta.",
    "cta.ios": "Lejupielādēt App Store",
    "cta.android": "Lejupielādēt Google Play",

    "footer.made": "Darināts Latvijā, Valmieras novadā.",
    "footer.legal.privacy": "Privātuma politika",
    "footer.legal.terms": "Lietošanas noteikumi",
    "footer.legal.support": "Atbalsts",
  },

  en: {
    "nav.features": "Features",
    "nav.privacy": "Privacy",
    "nav.download": "Download",

    "hero.eyebrow": "Personal expense tracking",
    "hero.title": "Know where",
    "hero.title.italic": "your",
    "hero.title.rest": "money goes.",
    "hero.sub": "Taupi is designed to be a quiet, everyday companion. No bloated charts, no empty insights — just your money, and some peace of mind.",
    "hero.cta.primary": "Download Taupi",
    "hero.cta.secondary": "How it works",

    "reveal.eyebrow": "The app",
    "reveal.title": "Less thinking, more control.",
    "reveal.screens.dashboard.label": "Home",
    "reveal.screens.dashboard.desc": "One number. What's safe to spend today.",
    "reveal.screens.budget.label": "Budget",
    "reveal.screens.budget.desc": "See where your salary goes.",
    "reveal.screens.insights.label": "Insights",
    "reveal.screens.insights.desc": "AI spots what you don't.",
    "reveal.screens.goals.label": "Goals",
    "reveal.screens.goals.desc": "Small limits. Big savings.",

    "features.eyebrow": "Features",
    "features.ai.title": "AI insights",
    "features.ai.body": "Every week Taupi looks at your habits and tells you what's changing.",
    "features.scan.title": "Receipt scan",
    "features.scan.body": "Photograph a receipt. Taupi reads the items, prices, and categories.",
    "features.trend.title": "Spending analysis",
    "features.trend.body": "See your daily, weekly and monthly rhythm in one tap.",

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
    "trust.signature": "One developer in Latvia. I reply to my own email.",

    "cta.title": "Start today.",
    "cta.sub": "Free to download. Works without an account.",
    "cta.ios": "Download on the App Store",
    "cta.android": "Get it on Google Play",

    "footer.made": "Made in Valmieras novads, Latvia.",
    "footer.legal.privacy": "Privacy Policy",
    "footer.legal.terms": "Terms of Service",
    "footer.legal.support": "Support",
  },
};

export function getDict(locale: Locale): Dict {
  return strings[locale] ?? strings[defaultLocale];
}
