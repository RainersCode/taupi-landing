import type { Locale } from "./strings";

/**
 * FAQ content for the calculator pages — the questions people actually
 * search for, complementing (not repeating) each page's method section.
 * Rendered by ToolFaq.astro together with FAQPage JSON-LD.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const toolFaqs: Record<string, Record<Locale, FaqItem[]>> = {
  budget: {
    lv: [
      {
        q: "Cik lielu daļu ienākumu tērēt mājoklim?",
        a: "Plaši lietota vadlīnija ir līdz 25% no neto ienākumiem; līdz 30% vēl ir pieņemami. Lielajās pilsētās īres cenas bieži spiež šo procentu augstāk — jo lielāks mājokļa īpatsvars, jo svarīgāk apzināti ieplānot mazāku daļu citās kategorijās.",
      },
      {
        q: "Kas ir 50/30/20 princips?",
        a: "Klasisks budžeta sadalījums: aptuveni 50% vajadzībām (mājoklis, rēķini, pārtika), 30% vēlmēm un 20% uzkrājumiem vai parādu atmaksai. Mūsu ieteicamais sadalījums balstās līdzīgos principos, tikai sadalīts sīkākās, praktiskākās kategorijās.",
      },
      {
        q: "Vai kalkulators saglabā manus datus?",
        a: "Skaitļi paliek tikai tavā pārlūkā — nekas netiek sūtīts uz serveri. Atgriežoties lapā, pēdējais aprēķins būs uz vietas, un to vari dzēst ar “Sākt no jauna”.",
      },
      {
        q: "Ko darīt, ja izdevumi pārsniedz ienākumus?",
        a: "Sāc ar lielākajām kategorijām — mājokli un transportu —, jo tur pat neliels samazinājums dod visvairāk. “Ko ja?” režīmā vari droši izmēģināt izmaiņas un uzreiz redzēt, cik tās dotu gadā.",
      },
    ],
    en: [
      {
        q: "How much of my income should go to housing?",
        a: "A widely used guideline is up to 25% of take-home pay; up to 30% is still acceptable. In big cities rents often push this higher — the more housing takes, the more deliberately the other categories need to shrink.",
      },
      {
        q: "What is the 50/30/20 rule?",
        a: "A classic budget split: roughly 50% for needs (housing, bills, food), 30% for wants and 20% for savings or debt payments. Our recommended split builds on the same principles, just broken into more practical categories.",
      },
      {
        q: "Does the calculator store my data?",
        a: "Your numbers stay in your browser only — nothing is sent to a server. When you come back, your last calculation is right where you left it, and “Start over” clears it.",
      },
      {
        q: "What if my expenses exceed my income?",
        a: "Start with the biggest categories — housing and transport — where even a small cut counts the most. In “What if?” mode you can safely test changes and immediately see what they'd add up to per year.",
      },
    ],
  },

  compound: {
    lv: [
      {
        q: "Kas ir saliktie procenti vienkāršos vārdos?",
        a: "Tie ir procenti, kas pelna procentus: atdevi saņem ne tikai tava iemaksātā nauda, bet arī iepriekš nopelnītais. Tāpēc uzkrājums aug arvien ātrāk, jo ilgāk tas paliek neaiztikts.",
      },
      {
        q: "Kādu gada atdevi likt aprēķinā?",
        a: "Plaši diversificēti akciju indeksu fondi ilgtermiņā vēsturiski devuši aptuveni 5–8% gadā, bet neviens gads nav garantēts. Konservatīvam skatam izmanto 4–5%, optimistiskam 7–8% — un salīdzini abus scenārijus.",
      },
      {
        q: "Vai šis ir investīciju ieteikums?",
        a: "Nē — tas ir izglītojošs rīks ar matemātisku aprēķinu pie nemainīgas gada atdeves. Reālas investīcijas svārstās, un vēsturiskā atdeve negarantē nākotnes rezultātus.",
      },
      {
        q: "Kāpēc sākt agri, pat ar mazu summu?",
        a: "Laiks ir salikto procentu galvenā sastāvdaļa: €50 mēnesī 30 gadus parasti pārspēj €150 mēnesī 10 gadus, jo procentiem ir vairāk laika pelnīt procentus. Pavelc gadu slīdni un pārbaudi pats.",
      },
    ],
    en: [
      {
        q: "What is compound interest in plain words?",
        a: "It's interest that earns interest: returns are paid not only on the money you put in, but also on what you've already earned. That's why a pot grows faster and faster the longer it stays untouched.",
      },
      {
        q: "What yearly return should I use?",
        a: "Broadly diversified stock index funds have historically returned around 5–8% a year over the long run, but no year is guaranteed. Use 4–5% for a conservative view, 7–8% for an optimistic one — and compare both.",
      },
      {
        q: "Is this investment advice?",
        a: "No — it's an educational tool doing the math at a constant yearly return. Real investments fluctuate, and past performance doesn't guarantee future results.",
      },
      {
        q: "Why start early, even with a small amount?",
        a: "Time is the main ingredient of compounding: €50 a month for 30 years usually beats €150 a month for 10, because the interest has more time to earn interest. Drag the years slider and see for yourself.",
      },
    ],
  },

  emergency: {
    lv: [
      {
        q: "Cik lielam jābūt drošības spilvenam?",
        a: "Vadlīnija ir 3–6 mēnešu obligāto izdevumu summa: 3 mēneši pie stabilas algas un mazām saistībām, 6 un vairāk — ja ienākumi svārstās, esi pašnodarbinātais vai ģimenē ir viens pelnītājs.",
      },
      {
        q: "Kur glabāt drošības spilvenu?",
        a: "Atsevišķi no ikdienas konta, bet ātri pieejamu — krājkontā vai īstermiņa depozītā. Tā nav investīciju nauda: tās uzdevums ir būt uz vietas, nevis augt.",
      },
      {
        q: "Ar ko sākt, ja uzkrājumu nav vispār?",
        a: "Sāc ar mazo mērķi — viena mēneša izdevumiem — un automātisku pārskaitījumu algas dienā. Plāna rinda kalkulatorā parāda, pēc cik mēnešiem mērķi sasniegsi ar savu summu.",
      },
      {
        q: "Vai spilvenu drīkst tērēt?",
        a: "Tieši tam tas ir domāts — negaidītiem, nepieciešamiem izdevumiem: salūzusi tehnika, ārsts, darba zaudēšana. Pēc izmantošanas to pamazām atjauno tāpat, kā sākumā uzkrāji.",
      },
    ],
    en: [
      {
        q: "How big should an emergency fund be?",
        a: "The guideline is 3–6 months of essential expenses: 3 months with a stable salary and few obligations, 6 or more if your income fluctuates, you're self-employed or your household has a single earner.",
      },
      {
        q: "Where should I keep an emergency fund?",
        a: "Separate from your everyday account but quickly reachable — a savings account or a short-term deposit. It's not investment money: its job is to be there, not to grow.",
      },
      {
        q: "Where do I start if I have no savings at all?",
        a: "Start with the small target — one month of expenses — and an automatic transfer on payday. The plan line in the calculator shows how many months it takes with your amount.",
      },
      {
        q: "Is it okay to spend the fund?",
        a: "That's exactly what it's for — unexpected, necessary costs: a broken appliance, a dentist, losing your job. Afterwards you rebuild it the same way you built it the first time.",
      },
    ],
  },

  debt: {
    lv: [
      {
        q: "Kas ir sniega bumbas metode?",
        a: "Katru mēnesi maksā minimumus visiem kredītiem, un visu brīvo naudu — kredītam ar mazāko atlikumu. Pirmais nomaksātais kredīts pienāk ātri, un šī uzvaras sajūta palīdz neapstāties.",
      },
      {
        q: "Kas ir lavīnas metode?",
        a: "Tas pats princips, tikai brīvā nauda iet uz kredītu ar augstāko procentu likmi. Matemātiski tā vienmēr ietaupa visvairāk procentu maksājumos.",
      },
      {
        q: "Kuru metodi izvēlēties?",
        a: "Ja atšķirība procentos ir liela, izvēlies lavīnu. Ja maza — ņem to, pie kuras tiešām turēsies: pabeigts plāns vienmēr pārspēj pamestu.",
      },
      {
        q: "Vai ātrie kredīti jāmaksā pirmie?",
        a: "Parasti jā — tiem mēdz būt augstākās likmes, tāpēc lavīnas kārtībā tie paši nonāk saraksta augšgalā. Ievadi savus kredītus ar īstajām likmēm, un kalkulators tos sarindos.",
      },
    ],
    en: [
      {
        q: "What is the snowball method?",
        a: "Every month you pay the minimum on every debt and throw all the spare money at the smallest balance. The first paid-off debt arrives quickly, and that feeling of a win keeps you going.",
      },
      {
        q: "What is the avalanche method?",
        a: "The same idea, except the spare money goes to the debt with the highest interest rate. Mathematically it always saves the most in interest payments.",
      },
      {
        q: "Which method should I pick?",
        a: "If the interest difference is large, pick avalanche. If it's small — pick the one you'll actually stick with: a finished plan always beats an abandoned one.",
      },
      {
        q: "Should payday loans be paid off first?",
        a: "Usually yes — they tend to carry the highest rates, so the avalanche order puts them at the top by itself. Enter your debts with their real rates and the calculator ranks them for you.",
      },
    ],
  },
};
