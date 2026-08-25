---
tool: "budget"
locale: "lv"
sources:
  - label: "CSP — Mājsaimniecību patēriņa izdevumu sastāvs un struktūra"
    href: "https://stat.gov.lv/lv/statistikas-temas/iedzivotaji/majsaimniecibu-izdevumi/tabulas/mbi031-majsaimniecibu-paterina"
  - label: "CSP — Darba samaksas pārmaiņas 2026. gada 1. ceturksnī"
    href: "https://stat.gov.lv/lv/statistikas-temas/darbs/alga/preses-relizes/27579-darba-samaksas-parmainas-2026-gada-1-ceturksni"
  - label: "VID — Neapliekamais minimums"
    href: "https://www.vid.gov.lv/lv/neapliekamais-minimums"
---

## Kāpēc procenti tabulā nesaskaitās līdz 100%

Pirmais, kas mulsina: ja saskaita visas ieteicamās daļas no tabulas augstāk, sanāk krietni vairāk par 100%. Tā nav kļūda.

Katrs procents tabulā ir **atsevišķs griests, nevis daļa no sadalījuma.** "Mājoklis līdz 25%" nozīmē "netērē mājoklim vairāk par ceturtdaļu", nevis "atvēli mājoklim tieši ceturtdaļu". Tāpēc griestus var izpildīt visus vienlaikus — tie vienkārši katrs atsevišķi pasaka, kad viena rinda ir kļuvusi par lielu.

No tā izriet svarīgs praksē: **visas rindas var būt zaļas, un budžets tik un tā var nesanākt.** Zaļa krāsa nozīmē "šī rinda nav pārmērīga", nevis "kopsumma iekļaujas ienākumos". Par kopsummu atbild atsevišķs rādītājs — **"Brīvi pāri"**. Ja tas ir sarkans, tu esi pārtērējis neatkarīgi no tā, cik rindas ir zaļas.

Praktiskā lasīšanas secība ir tāda:

1. **Vispirms "Brīvi pāri".** Vai kopsumma vispār iekļaujas ienākumos?
2. **Tad sarkanās rindas.** Kura kategorija izlec visvairāk?
3. **Tad uzkrājumu rinda.** Tā ir vienīgā, kurai jābūt *vismaz* norādītajā līmenī, nevis *ne vairāk kā*.

## Kas iet kurā rindā

Rezultāts ir tik precīzs, cik precīzi sadali izdevumus. Biežāk apstrīdamie gadījumi:

| Rinda | Šeit liec | Nevis šeit |
|---|---|---|
| Mājoklis | Īre vai hipotēkas maksājums, apsaimniekošana, mājokļa apdrošināšana | Komunālos — tiem ir sava rinda |
| Komunālie | Siltums, elektrība, gāze, ūdens, atkritumi, internets, telefons | Mājokļa remontu — tas ir "Citi" |
| Transports | Degviela, sabiedriskais transports, OCTA, apkope, auto līzings | Auto kredītu, ja to skaiti "Parādos" — izvēlies vienu vietu |
| Pārtika | Pārtika mājās | Restorānus un kafejnīcas — tie ir "Citi" |
| Uzkrājumi | Drošības spilvens, ilgtermiņa uzkrājumi, pensiju 3. līmenis | Kredītu maksājumus |
| Parādi | Kredītu minimālie maksājumi | Papildu iemaksas virs minimuma — tie ir uzkrājumi |
| Citi | Viss pārējais: apģērbs, veselība, izklaide, abonementi, bērni | — |

Divas lietas, kuras vērts zināt par "Citi" rindu. Pirmkārt, tā ir plašākā kategorija ar attiecīgi augstāko griestu — ja tur nonāk pārāk daudz, rezultāts kļūst neinformatīvs. Otrkārt, **"Manas rindas" ieskaitās tieši "Citi" slieksnī**: pievienojot, piemēram, bērnudārzu vai dzīvnieku, tā summa parādās atsevišķi, bet vērtējumā pieskaitās "Citi". Tāpēc, ja "Citi" pēkšņi kļūst dzeltens pēc savas rindas pievienošanas, tas ir gaidīts, nevis kļūda.

## Kāpēc ar parādiem uzkrājumu rinda paliek dzeltena

Šī ir kalkulatora uzvedība, kas visbiežāk izraisa jautājumus, tāpēc paskaidrosim godīgi.

Poga **"Ieteicamais sadalījums"** neaiztiek tavu parādu rindu — kredītu maksājumi ir līgumsaistības, ne izvēle. Tā paņem to, kas paliek pāri pēc parādiem, un sadala **to** pēc ieteicamajām proporcijām. Bet uzkrājumu griestu — vismaz 20% — mēra pret **visiem** ienākumiem.

Rezultāts ar vidējo neto algu €1 364:

| Parādi mēnesī | Ieteicamie uzkrājumi | No visiem ienākumiem | Statuss |
|---|---|---|---|
| €0 | €272,80 | 20,0% | Zaļš |
| €150 | €242,80 | 17,8% | Dzeltens |
| €300 | €212,80 | 15,6% | Dzeltens |

Tas nozīmē: **ja tev ir kaut kādi parādi, ieteicamais sadalījums vienmēr dos dzeltenu uzkrājumu rindu.** Tā nav pretruna — tas ir precīzs apraksts situācijai. Kamēr daļa naudas aiziet kredītos, uzkrāt pilnus 20% no ienākumiem nav iespējams, un rādītājs to godīgi parāda, nevis noslēpj. Dzeltenā rinda pazūd tad, kad pazūd parādi.

Ja tieši tā ir tava situācija, noderīgākais nākamais solis ir nevis pārbīdīt slīdņus, bet saīsināt parādu — [kredītu atmaksas kalkulators](/kreditu-atmaksas-kalkulators/) rāda, cik ātri tas var notikt.

## Divi režīmi, ko ir vērts izmantot

**"Fiksēt kopsummu".** Ieslēdz to, un, velkot vienu slīdni, pārējās rindas automātiski pielāgojas tā, ka kopsumma vienmēr paliek vienāda ar ienākumiem. Tas atbild uz jautājumu "no kā man būs jāatsakās, ja īre pieaugs par €50" — jo atbilde vienmēr ir "no kaut kā cita", un šis režīms liek to izvēlēties.

**"Tagad" un "Ko ja?".** Otrais režīms ļauj izmēģināt izmaiņas, neaiztiekot īsto budžetu. Vērtīgākais tur nav pati aina, bet **gada starpība**: kalkulators parāda ne tikai, cik vairāk paliktu mēnesī, bet cik tas ir gadā. €40 mēnesī ir viegli noraidīt; €480 gadā izskatās citādi. Turklāt tas saka, cik rādītāju uzlabojās un cik pasliktinājās, tāpēc redzi, vai ietaupījums vienā vietā nav radījis problēmu citur.

## Kā to salīdzināt ar Latvijas vidējiem rādītājiem

Šeit jābūt uzmanīgam, jo divi skaitļi, ko gribas salīdzināt, mēra dažādas lietas.

CSP mājsaimniecību budžeta apsekojums par 2025. gadu rāda patēriņa izdevumus **uz vienu cilvēku** — €619 mēnesī, no tiem pārtikai €151 (24,4%), mājoklim un komunālajiem €100 (16,2%), transportam €74 (11,9%). Bet tie procenti ir **daļa no izdevumiem**, savukārt kalkulatora griesti ir **daļa no neto ienākumiem**. Tie nav viens un tas pats: ja daļu ienākumu uzkrāj, izdevumu procenti vienmēr būs lielāki.

Pārrēķinot CSP summas pret vidējo neto algu (€1 364), sanāk pavisam cita aina: pārtika ~11%, mājoklis ar komunālajiem ~7%, transports ~5% — visas komfortabli zaļā zonā.

Un tieši tāpēc CSP vidējos nevar lietot kā mērķi. Divi iemesli:

- **Tie ir uz vienu cilvēku.** Divu pieaugušo mājsaimniecībā ar €600 īri katram "pienākas" €300, nevis €600 — bet tavā personīgajā budžetā rinda būs tik liela, cik tu reāli maksā.
- **Mājokļa vidējais ir mānīgs.** €100 ir vidējais pār visām mājsaimniecībām, ieskaitot tās, kurām mājoklis pieder bez hipotēkas un kuras maksā tikai komunālos. Īrniekam Rīgā šis skaitlis ar realitāti nesaskan.

Izmanto tos kā aptuvenu pārbaudi, vai neesi kaut ko aizmirsis, nevis kā atzīmi.

## Ko darīt ar sarkanu rindu

Rindas nav vienlīdz svarīgas — sākt ir vērts no tās, kur nauda tiešām ir.

- **Mājoklis virs 30%.** Grūtākā, bet ietekmīgākā rinda: tā ir lielākais atsevišķais izdevums vairumam mājsaimniecību. Risinājumi ir lēni — pārcelšanās, īres pārrunas, istabas biedrs, hipotēkas pārskatīšana — bet neviena cita rinda tik daudz nedod.
- **Transports virs 20%.** Parasti tas nozīmē auto, kas maksā vairāk, nekā šķiet: līzings plus degviela plus OCTA plus apkope. Šeit palīdz izrēķināt pilnās gada izmaksas, nevis tikai degvielu.
- **Pārtika virs 20%.** Visbiežāk tas nav veikals, bet restorāni un piegādes, kas ieskaitītas nepareizajā rindā. Vispirms pārbaudi sadalījumu, tikai tad plānus.
- **"Citi" virs 40%.** Gandrīz vienmēr nozīmē, ka tur ir sabāzts kaut kas, kam pienākas sava rinda. Pievieno savas rindas un skaties vēlreiz.
- **Uzkrājumi zem 10%.** Vienīgā rinda, kur problēma ir par maz. Ja pārējais ir kārtībā, bet uzkrājumu nav, parasti trūkst nevis naudas, bet automātiska pārskaitījuma algas dienā.

## Biežākās kļūdas lasot rezultātu

- **Ievadīt bruto algu.** Visi griesti ir no neto. Ar bruto katra rinda izskatās mazāka, nekā ir patiesībā — cik no bruto paliek pāri, rāda [50/30/20 raksts](/padomi/50-30-20-budzeta-metode/).
- **Aizmirst gada izdevumus.** OCTA, tehniskā apskate, atvaļinājums, dāvanas. Izdali gada summu ar 12 un ieliec attiecīgajā rindā — citādi budžets ir pareizs vienpadsmit mēnešus gadā.
- **Skaitīt kredīta papildu iemaksas parādos.** Minimums ir parāds, viss virs tā ir uzkrājums. Sajaucot, abas rindas rāda nepareizi.
- **Dzīt visas rindas zaļumā uzreiz.** Viena rinda ceturksnī, sākot ar lielāko, dod vairāk nekā vienlaicīgs uzbrukums visām.
- **Uzskatīt zaļu par mērķi.** Zaļš nozīmē "nav pārmērīgs". Vai plāns ir labs, izšķir tas, kas paliek pāri un kur tas aiziet.
