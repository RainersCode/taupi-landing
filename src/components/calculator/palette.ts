/**
 * Rīku un diagrammu krāsas — VIENĪGAIS avots.
 *
 * Iepriekš katrs kalkulators turēja savu cieti iekodētu hex komplektu, un
 * visi bija izvēlēti tumšajai tēmai. Kad lapa kļuva gaiša (2026-09-19), tie
 * uz lavandas fona deva 1.48–2.99:1, kad lasāmam tekstam vajag 4.5:1 —
 * praktiski nelasāmi. Tā kā krāsa dzīvoja piecos failos, katrs labojums
 * nozīmēja piecas vietas; tagad tā ir viena.
 *
 * Skaitļi iekavās ir izmērīts kontrasts pret lapas fonu (239 233 250).
 * Ja kādu maini, PĀRMĒRI — 4.5:1 tekstam, 3:1 grafikai un ikonām.
 *
 * Šeit ir hex, nevis CSS mainīgie, ar nolūku: šīs vērtības aiziet arī uz SVG
 * prezentācijas atribūtiem (fill=, stroke=), un tie `var()` NEATBALSTA.
 */

/** Labi, pieaugums, mērķis izpildīts. (4.62:1) */
export const OK = "#00794A";

/** Neitrāla informācija, otrā sērija diagrammās. (4.74:1) */
export const INFO = "#0B6E9E";

/** Pārtēriņš, kļūda, negatīvā puse. (4.95:1) */
export const BAD = "#C2185B";

/** Trešā sērija; agrākais "long-term" indigo. (5.29:1) */
export const INDIGO = "#4C4FD1";

/** Procentu rīka parakstkrāsa. (4.87:1) */
export const GOLD = "#96560A";

/** Zīmola violets — tas pats, kas --brand. (4.85:1) */
export const BRAND = "#7A45D6";

/** "Bez papildu maksājuma" trajektorija — apzināti klusa, bet lasāma. (4.70:1) */
export const GHOST = "#6C628C";

/**
 * Diagrammu segmentu atdalītājs. Tas ir LAPAS FONS, ne krāsa pati par sevi —
 * segmentus šķir ar fona krāsas līniju. Bija #0D1128 (navy) un uz gaišās
 * lapas tas vilka melnas svītras pāri visām diagrammām.
 */
export const SURFACE = "#EFE9FA";

/**
 * Parādu sēriju palete. Šīs NAV mainītas: pārmērītas pret gaišo fonu un visas
 * dod 3.20–3.67:1, kas grafikai ir pietiekami. Sākotnēji tās izvēlētas pēc
 * ΔE atdalāmības arī deiteranopijā — to īpašību pārkrāsošana sabojātu.
 */
export const SERIES = ["#5A6BFF", "#00919D", "#D93F61", "#058BBD", "#CA5A03", "#B250C2"];
