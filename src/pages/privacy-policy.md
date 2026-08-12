---
layout: "~/layouts/Legal.astro"
title: "Privātuma politika"
description: "Kā Taupi vāc, izmanto un aizsargā tavus datus — glabāšana Eiropas Savienībā, šifrēšana, tavas GDPR tiesības un kontakti jautājumiem."
updated: "2026-05-08"
version: "2.1"
locale: "lv"
---

## 1. Kas mēs esam

Taupi ("mēs", "mūs", "lietotne") ir personīgo budžetu un izdevumu sekošanas lietotne, kuru pārvalda taupi.eu.

- **Kontakts:** info@taupi.eu

Mēs esam **datu pārzinis** attiecībā uz personas datiem, ko apstrādājam par tevi. Ja vēlies izmantot kādu no zemāk aprakstītajām tiesībām vai tev ir jautājumi par šo politiku, raksti uz iepriekš norādīto e-pastu.

## 2. Kādus datus mēs vācam

Mēs apzināti turam datu vākšanu minimālu.

### Dati, ko sniedz, izveidojot kontu
- **E-pasta adrese** — pierakstam un paroles atjaunošanai.
- **Parole** — glabājas tikai kā sālīts hash mūsu autentifikācijas pakalpojumā (Supabase Auth). Mēs nekad neredzam tavu paroli atvērtā formā.
- **OAuth identifikators** (pēc izvēles) — ja pierakstīsies ar Google, Apple vai Facebook, no šī pakalpojuma saņemam stabilu lietotāja ID un tavu e-pastu. Mēs **nepieprasām** piekļuvi taviem kontaktiem, kalendāram, ierakstiem vai citiem datiem no šiem pakalpojumiem.

### Dati, ko ievadi, lietojot lietotni
- Mēneša ienākumi, fiksētās izmaksas, izdevumi, ieguldījumi, ilgtermiņa mērķi un piezīmes, ko pievieno ierakstiem.
- Profila signāli AI ieskatu pielāgošanai: vecuma diapazons, mājsaimniecības lielums, pilsēta un tavs galvenais finanšu mērķis. Šie ir neobligāti.

### Dati no čeku skenēšanas (tikai ja izmanto)
- **Čeku attēli**, ko nofotografē vai augšupielādē OCR atpazīšanai.
- **Atpazītās preces, summas un veikala nosaukums**, kas izvilkti no šiem čekiem.
- Attēli tiek pārsūtīti uz mūsu čeku apstrādes pakalpojumu un Anthropic Claude API teksta atpazīšanai; **mēs nesaglabājam attēlu pēc apstrādes pabeigšanas**.

### Tehniskie dati
- **Ierīces / platformas identifikatori**, ko sniedz operētājsistēma (iOS / Android versija, ierīces modelis) — tikai avāriju izmeklēšanai un push paziņojumu maršrutēšanai, nekad reklāmai.
- **IP adrese** — mūsu API aizmugures sistēmā ļaunprātīgas izmantošanas novēršanai un pieprasījumu ierobežošanai; saglabājas žurnālos līdz 14 dienām.
- **Push paziņojumu žetons** (ja iespējosi paziņojumus) — maršrutēts caur Expo push pakalpojumu.

### Anonīmi kopienas cenu dati (tikai ja piekrīti)
Ja iestatījumos iespējosi "Dalīties ar cenām anonīmi", skenēto čeku preces — **veikals, preces nosaukums, cena, datums** — tiek pievienotas koplietotam katalogam, lai citi lietotāji varētu redzēt cenas dažādos veikalos. **Netiek pievienots lietotāja ID, e-pasts, ierīces ID vai atrašanās vieta.** Tu jebkurā brīdī vari šo izslēgt; jau ieguldītās rindas paliek katalogā, jo vairs nav piesaistāmas tev.

### Ko mēs NEvācam
- Bankas konta datus vai darījumus. Mēs nekad nepieslēdzamies tavai bankai.
- Atrašanās vietas (GPS) datus.
- Kontaktus, kalendāru, SMS vai foto bibliotēku ārpus konkrētajiem attēliem, ko nodod čeku skenerim.
- Reklāmu identifikatorus (IDFA / GAID).
- Analītiku par to, kā lieto atsevišķus ekrānus.

## 3. Kāpēc apstrādājam tavus datus (mērķi un juridiskais pamats)

| Mērķis | Izmantotie dati | Juridiskais pamats (VDAR 6. pants) |
|---|---|---|
| Konta izveide un aizsardzība | e-pasts, paroles hash, OAuth ID | Līgums (6.(1)(b)) |
| Tavu finanšu ierakstu rādīšana | tavi ieraksti | Līgums (6.(1)(b)) |
| AI ieskatu un kopsavilkumu ģenerēšana | ieraksti + profila signāli | Leģitīmas intereses (6.(1)(f)) — pamatpakalpojuma sniegšana |
| Čeku attēlu apstrāde | attēls, kas nosūtīts AI pakalpojumam | Līgums (6.(1)(b)) — tu uzsāki skenēšanu |
| Push paziņojumu sūtīšana (dienas atgādinājums, nedēļas kopsavilkums) | push žetons + ierakstu dati | Piekrišana (6.(1)(a)) — iespējo iestatījumos |
| Iemaksa anonīmajā cenu katalogā | prece / veikals / cena (bez lietotāja ID) | Piekrišana (6.(1)(a)) |
| Ļaunprātīgas izmantošanas novēršana un drošība | IP + pieprasījuma metadati | Leģitīmas intereses (6.(1)(f)) |
| Atbildēšana uz juridiskiem pieprasījumiem | kas vajadzīgs | Juridisks pienākums (6.(1)(c)) |

Tu vari atsaukt piekrišanu jebkurā brīdī (push / cenu dalīšanai) iestatījumos. Atsaukšana neietekmē apstrādi, kas jau notikusi.

## 4. Kas apstrādā tavus datus mūsu vārdā (apakšapstrādātāji)

Mēs izmantojam šādus pakalpojumu sniedzējus ("apstrādātājus"). Viņi apstrādā datus tikai pēc mūsu norādījumiem.

| Pakalpojuma sniedzējs | Ko dara | Atrašanās vieta | Aizsardzība |
|---|---|---|---|
| **Supabase** (Supabase, Inc.) | Datubāze + autentifikācija | ES (Frankfurte) | Datu apstrādes līgums; izvietots ES |
| **Anthropic** (Anthropic PBC) | Claude LLM čeku OCR un ieskatiem | ASV | Standarta līguma noteikumi; API dati netiek izmantoti modeļu apmācībai saskaņā ar Anthropic komerciālo politiku |
| **Vercel** (Vercel Inc.) | Mitina mūsu API galapunktus (čeku OCR proxy, ieskatu proxy) | ASV / ES | Standarta līguma noteikumi |
| **Apple Inc.** | "Sign in with Apple" identitātes pakalpojums | Īrija / ASV | Apple paša pārziņa/apstrādātāja noteikumi |
| **Google LLC** | "Sign in with Google" identitātes pakalpojums | Īrija / ASV | Google paša pārziņa/apstrādātāja noteikumi |
| **Meta Platforms Ireland Ltd.** | "Sign in with Facebook" identitātes pakalpojums | Īrija / ASV | Meta noteikumi |
| **Expo, Inc.** | Push paziņojumu žetonu maršrutēšana (uz APNs / FCM) | ASV | Standarta līguma noteikumi |

Ja pievienosim vai mainīsim apakšapstrādātāju, kas būtiski ietekmē tavus datus, atjaunināsim šo lapu un mainīsim versijas numuru augšā.

## 5. Starptautiskie datu pārsūtījumi

Tavi galvenie dati (konts, ieraksti, čeki apstrādes laikā) glabājas **Eiropas Savienībā** (Supabase Frankfurtē). Kad sūtām datus ārpus ES — piemēram, čeka attēlu uz Anthropic OCR vai push žetonu caur Expo — paļaujamies uz **ES Standarta līguma noteikumiem**, ko apstiprinājusi Eiropas Komisija, lai aizsargātu tavus datus.

## 6. Cik ilgi glabājam tavus datus

| Dati | Glabāšanas termiņš |
|---|---|
| Konts + finanšu ieraksti | Glabājas, kamēr tavs konts pastāv. Dzēsti **30 dienu** laikā pēc konta dzēšanas. |
| Supabase datubāzes dublējumkopijas | Rotētas ārā **90 dienu** laikā pēc dzēšanas. |
| Čeku attēli, kas nosūtīti AI | **Netiek saglabāti** — atmesti uzreiz pēc apstrādes. |
| API / ļaunprātīgas izmantošanas žurnāli | **14 dienas** rotējoši. |
| Anonīmā cenu kataloga rindas | Glabājas neierobežoti depersonalizētā formā (nav piesaistāmas tev). |
| Klientu atbalsta e-pasti | **24 mēneši** no pēdējās sarakstes. |

## 7. Kā aizsargājam tavus datus

- Datu plūsma šifrēta pārsūtē (HTTPS / TLS 1.2+).
- Dati miera stāvoklī šifrēti ar Supabase.
- Rindu līmeņa drošība (RLS) datubāzē nozīmē, ka tikai tavs autentificētais konts var lasīt vai rakstīt tavās rindās — to nodrošina vaicājuma slānis.
- Mūsu API galapunkti ir ar pieprasījumu ierobežojumiem un prasa lietotnes noslēpumu; tos nevar izsaukt anonīmi no pārlūka.

Neviena sistēma nav 100 % droša. Ja kādreiz piedzīvosim datu noplūdi, kas skar tavus personas datus, paziņosim tev un uzraudzības iestādei 72 stundu laikā, kā prasa VDAR 33.–34. pants.

## 8. Tavas tiesības

Saskaņā ar VDAR tev ir tiesības:

- **Piekļūt** — saņemt kopiju datiem, ko par tevi glabājam (15. pants).
- **Labot** — labot neprecīzus datus (16. pants).
- **Dzēst** — dzēst kontu un visus saistītos datus (17. pants). Pieskaries Iestatījumi → Dzēst kontu vai raksti mums.
- **Ierobežot** — lūgt mums apturēt apstrādi (18. pants).
- **Pārnest** — saņemt savus datus mašīnlasāmā formātā (20. pants). Pieskaries Iestatījumi → Eksportēt CSV vai raksti mums JSON eksportam.
- **Iebilst** — pret apstrādi, kas balstīta uz leģitīmām interesēm (21. pants).
- **Atsaukt piekrišanu** — push paziņojumiem vai cenu dalīšanai iestatījumos.
- **Netikt pakļautam lēmumam, kas balstīts vienīgi uz automatizētu apstrādi** (22. pants). Mūsu AI funkcijas ir informatīvas; tās nekad neatņem tev finanšu produktu vai pakalpojumu.

Lai izmantotu kādu tiesību, raksti uz **info@taupi.eu**. Atbildam 30 dienu laikā.

Ja uzskati, ka mēs nepareizi rīkojamies ar taviem datiem, vari iesniegt sūdzību **Datu valsts inspekcijai** — Elijas iela 17, Rīga, LV-1050, [dvi.gov.lv](https://www.dvi.gov.lv) — vai vietējā ES datu aizsardzības iestādē.

## 9. AI funkcijas — kas atstāj tavu ierīci

Kad lieto **AI ieskatus** vai **čeku skenēšanu**:

- Attiecīgie dati (tavu ierakstu kopsavilkums vai čeka attēls) tiek nosūtīti no tavas ierīces uz mūsu API aizmugures sistēmu (mitināta Vercel), kas tos pārsūta uz **Anthropic Claude API** caur TLS.
- Anthropic apstrādā pieprasījumu un atgriež rezultātu. Saskaņā ar Anthropic komerciālajiem API noteikumiem **tavi dati netiek izmantoti modeļu apmācībai** un tos saglabā tikai īsu laiku darbības un ļaunprātīgas izmantošanas novēršanas vajadzībām (skat. Anthropic politiku [anthropic.com/privacy](https://www.anthropic.com/privacy)).
- AI rezultāts ir tikai informatīvs — tā **nav finanšu, nodokļu, ieguldījumu vai juridiska konsultācija**. Skat. Lietošanas noteikumus.
- Iesakām nelikt brīvā teksta laukos to, ko nevēlies, lai redzētu trešās puses pakalpojums (piem., personas kodus, medicīnisku informāciju).

## 10. Bērni

Taupi nav paredzēta bērniem, kas jaunāki par 16 gadiem (ES) vai 13 gadiem (ASV). Mēs apzināti nevācam datus no bērniem. Ja domā, ka bērns ir izveidojis kontu, raksti mums, un mēs to dzēsīsim.

## 11. Sīkdatnes, izsekošana, analītika

Mēs **nelietojam** nekādu analītiku, reklāmas tīklus, izsekošanas pikseļus vai starpaplikāciju identifikatorus. Lietotne neizmanto sīkdatnes. iOS App Tracking Transparency neattiecas, jo mēs neizsekojam tevi citu uzņēmumu lietotnēs vai vietnēs.

## 12. Šīs politikas izmaiņas

Kad mainīsim politiku, mēs:

1. Mainīsim versiju un "Atjaunināts" datumu augšā.
2. Parādīsim paziņojumu lietotnē nākamajā atvēršanas reizē, ja izmaiņas ir būtiskas.

Aizstātās versijas glabājas Git vēsturē mūsu publiskajā repozitorijā caurspīdīguma labad.

## 13. Kontakti

- E-pasts: **info@taupi.eu**
