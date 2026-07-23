# Taupi landing refresh — design

**Datums:** 2026-07-23
**Statuss:** apstiprināts brainstormā (Rainers)
**Tvērums:** uzfrišināt esošo dizainu — struktūra un animācijas paliek, saturs atjaunojas.

## Mērķis

Lapa rāda veco, ar roku kodēto lietotnes UI (DashboardMock u.c.), kas vairs neatbilst
reālajai lietotnei, un tai trūkst Gredzens logo. CTA joprojām ir veikalu pogas, lai gan
lietotne vēl nav veikalos. Atjaunojam uz īstiem ekrānuzņēmumiem, pašreizējo brendu un
waitlist e-pastu vākšanu.

## 1. Īstie ekrānuzņēmumi koda mocku vietā

- `PhoneFrame` iegūst `screenshot` propu (attēla URL). Ja tas ir dots, rāmis rāda
  attēlu un slēpj savu viltus notch/statusjoslu (ekrānuzņēmumos tā jau ir).
- Mock komponenti (`mocks/DashboardMock|BudgetMock|InsightsMock|GoalsMock.tsx`) tiek
  dzēsti pēc tam, kad neviena vieta tos vairs neizmanto.
- Avots: `expenses/assets/store/ekranuznemumi/IMG_0629..0633.PNG` (1206×2622).
  Optimizācija ar `sharp` vienreizēju skriptu: resize līdz 800 px platumam, WebP
  (~kvalitāte 82) → `public/images/screens/*.webp`.

| Vieta | Fails | Saturs |
|---|---|---|
| Hero | screens/sakums.webp (IMG_0629) | Sākums — dienas budžeta gredzens €17.50 |
| Reveal 1 "Darījumi" | screens/darijumi.webp (IMG_0630) | Darījumu saraksts, kategorijas, čeku pozīcijas |
| Reveal 2 "Budžets" | screens/budzets.webp (IMG_0631) | Budžeta iestatīšana €2373 → €807 |
| Reveal 3 "Ieskati" | screens/ieskati.webp (IMG_0632) | Finansiālā veselība 70, prognoze €2931/gadā |
| Reveal 4 "Nauda kopskatā" | screens/kopskats.webp (IMG_0633) | Neto vērtība, padoms, dienas jautājums |

- Peldošo badge saturs pielāgojas ekrāniem (piem., −€25.02 Maxima "Tikko" hero pusē).
- EN lapa pagaidām rāda tos pašus LV ekrānus; EN komplektu var eksportēt vēlāk.

## 2. Gredzens logo un krāsas

- Nav + Footer: ring mark + `taupi.` vārdzīme (avots: `expenses/assets/logo/`).
- Favicon: Gredzens (SVG) vecā "t." vietā.
- Akcenta krāsa `#4FD1FF` → Piparmētra `#38BDF8` (tailwind config + inline vietas).
- Brenda indigo paliek `#5A6BFF` → `#3A4AE0`.

## 3. Waitlist CTA veikalu pogu vietā

- `DownloadCTA` → "Piesakies agrīnai piekļuvei": e-pasta lauks + poga, LV/EN.
- Backend: Vercel API funkcija landing repo (`api/waitlist.ts`):
  - POST {email, locale}; validācija + honeypot lauks pret botiem.
  - Ieraksta Supabase tabulā `waitlist` (id, email unique, locale, source, created_at)
    ar `SUPABASE_SERVICE_KEY` env mainīgo (jāpievieno Vercel projektā).
  - Atbildes: 200 (arī uz duplikātu — idempotenti), 400 uz nederīgu e-pastu.
- Frontend stāvokļi: idle → sūta → paldies / kļūda. Bez ārējiem servisiem.
- Hero primārā poga skrollē uz #waitlist (līdzšinējā #download vietā).
- Jauna Supabase migrācija/tabula jāizveido `expenses` projektā (RLS: tikai service
  role raksta; anon nelasa).

## 4. Tekstu atjauninājumi (LV kanoniski, EN tulkojums)

- Reveal sadaļu nosaukumi/apraksti atbilst jaunajiem ekrāniem (sk. tabulu).
- FeatureGrid: AI čeku skenēšana ar pozīcijām, 23 kategorijas, mērķi ar piesaistītiem
  kontiem, izaicinājumi, Taupi pulss rīta digests, finansiālās veselības skors.
- Hero apakšvirsraksts nemainās, ja vien nav pretrunā ar jauno CTA.

## Nemainās

Hero animācijas, sticky-scroll ProductReveal mehānika, LifestylePanel, TrustPanel,
legal lapas, i18n mehānisms, Astro/Tailwind/motion steks.

## Pārbaude

- Lokāli: `npm run dev` → http://localhost:4321 (LV) un /en — Rainers apstiprina vizuāli.
- `npm run build` bez kļūdām pirms commit.
- Waitlist: lokāli ar `vercel dev` vai pēc preview deploy; pārbaudīt ierakstu Supabase.
- Push uz produkciju tikai pēc Rainera apstiprinājuma.
