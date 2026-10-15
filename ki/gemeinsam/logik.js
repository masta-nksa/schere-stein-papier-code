// Spiellogik und Protokoll, ohne Kamera und ohne Anzeige.
// Wird von beiden Seiten (01-erkennen und 02-microbit) benutzt. Die Tests dazu liegen im Material-Repo (ki/test/).

// Kodierung wie auf dem micro:bit: 0 = Stein, 1 = Papier, 2 = Schere
const NAMEN = ['Stein', 'Papier', 'Schere'];

// Dieselben 5x5-Bilder wie in microbit/03_ssp.py (9 = hell, 0 = aus)
const BILDER = [
  '00000:09990:09990:09990:00000',   // Stein
  '99999:90009:90009:90009:99999',   // Papier
  '99009:99090:00900:99090:99009',   // Schere
];

const SCHWELLE = 0.8;       // so sicher muss das Modell mindestens sein, damit ein Bild zählt
const FENSTER_MS = 500;     // so weit zurück schauen wir bei der Entscheidung
const MIN_PROBEN = 3;       // so viele sichere Bilder mit Handzeichen braucht es mindestens
const NACHFRIST_MS = 250;   // so lange wartet die Seite nach der 0, bevor sie entscheidet

// 1 = ich gewinne, 0 = unentschieden, -1 = ich verliere (genau wie ergebnis() auf dem micro:bit)
function ergebnis(ich, gegner) {
  const d = (((ich - gegner) % 3) + 3) % 3;   // JavaScript rechnet bei negativen Zahlen anders als Python
  if (d === 0) return 0;
  if (d === 1) return 1;
  return -1;
}

// Klassenname aus Teachable Machine -> Code (0, 1, 2) oder null (z. B. "nichts")
function klasseZuCode(name) {
  const n = String(name).trim().toLowerCase();
  if (n === 'stein') return 0;
  if (n === 'papier') return 1;
  if (n === 'schere') return 2;
  return null;
}

// Entscheidet, welches Handzeichen gezeigt wurde.
// proben: Liste von { t, klasse, p } (t in Millisekunden, p = Sicherheit 0 bis 1)
// Es zählen nur sichere Bilder mit einem Handzeichen. "nichts" und unbekannte Klassen stimmen nicht mit ab,
// sonst würde eine Hand, die erst kurz vor 0 erscheint, von den "nichts"-Bildern übertönt.
// Gibt 0, 1, 2 zurück oder null ("nicht sicher": Runde wiederholen).
function entscheide(proben, jetzt, fensterMs = FENSTER_MS, schwelle = SCHWELLE, minProben = MIN_PROBEN) {
  return analysiere(proben, jetzt, fensterMs, schwelle, minProben).code;
}

// Wie entscheide(), liefert aber auch die Zahlen dahinter (für das Log der Seite):
// { code, gesamt (Bilder im Zeitfenster), gueltig (sichere Bilder mit Handzeichen), zaehler (pro Klasse) }
function analysiere(proben, jetzt, fensterMs = FENSTER_MS, schwelle = SCHWELLE, minProben = MIN_PROBEN) {
  const zaehler = {};
  let gueltig = 0, gesamt = 0;
  for (const pr of proben) {
    if (pr.t < jetzt - fensterMs || pr.t > jetzt) continue;   // ausserhalb des Zeitfensters
    gesamt++;
    if (pr.p < schwelle) continue;                            // zu unsicher
    if (klasseZuCode(pr.klasse) === null) continue;           // "nichts" stimmt nicht mit ab
    zaehler[pr.klasse] = (zaehler[pr.klasse] || 0) + 1;
    gueltig++;
  }
  const antwort = { code: null, gesamt, gueltig, zaehler };
  if (gueltig < minProben) return antwort;

  let besteKlasse = null, besteAnzahl = 0, gleichstand = false;
  for (const klasse in zaehler) {
    if (zaehler[klasse] > besteAnzahl) {
      besteKlasse = klasse; besteAnzahl = zaehler[klasse]; gleichstand = false;
    } else if (zaehler[klasse] === besteAnzahl) {
      gleichstand = true;
    }
  }
  if (!gleichstand) antwort.code = klasseZuCode(besteKlasse);
  return antwort;
}

// ---------- Serielles Protokoll (Textzeilen mit \n, 115200 Baud) ----------
//   micro:bit -> Browser:  C3 C2 C1 | ? | R <ich> <gegner> <ergebnis> | P <ich> <gegner> | X
//   Browser -> micro:bit:  G0 G1 G2 | G-
// "ich" ist immer die Person vor diesem Browser, "gegner" der micro:bit bzw. die andere Person.
// ergebnis: 1 = ich gewinne, 0 = unentschieden, -1 = ich verliere.

// Eine Zeile vom micro:bit lesen. Gibt ein Objekt zurück, bei unbekannten Zeilen null.
function parseVonMicrobit(zeile) {
  const z = String(zeile).trim();
  let m;
  if ((m = /^C([1-3])$/.exec(z))) return { typ: 'C', n: Number(m[1]) };
  if (z === '?') return { typ: '?' };
  if (z === 'X') return { typ: 'X' };
  if ((m = /^R ([0-2]) ([0-2]) (-1|0|1)$/.exec(z))) {
    return { typ: 'R', ich: Number(m[1]), gegner: Number(m[2]), ergebnis: Number(m[3]) };
  }
  if ((m = /^P (\d+) (\d+)$/.exec(z))) return { typ: 'P', ich: Number(m[1]), gegner: Number(m[2]) };
  return null;
}

// Antwort an den micro:bit: Code 0, 1, 2 oder null ("nicht sicher")
function formatAnMicrobit(code) {
  if (code === 0 || code === 1 || code === 2) return 'G' + code + '\n';
  return 'G-\n';
}

// Sammelt Text-Stücke vom USB-Kabel und gibt ganze Zeilen zurück (Stücke können mitten in einer Zeile enden)
class ZeilenPuffer {
  constructor() { this.rest = ''; }
  push(text) {
    this.rest += text;
    const teile = this.rest.split('\n');
    this.rest = teile.pop();
    if (this.rest.length > 200) this.rest = '';     // Müll ohne Zeilenende wegwerfen
    return teile.map(z => z.replace(/\r/g, '').trim()).filter(z => z.length > 0);
  }
}

// Für Node (Tests); im Browser gibt es kein "module"
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NAMEN, BILDER, SCHWELLE, FENSTER_MS, MIN_PROBEN, NACHFRIST_MS,
    ergebnis, klasseZuCode, entscheide, analysiere, parseVonMicrobit, formatAnMicrobit, ZeilenPuffer,
  };
}
