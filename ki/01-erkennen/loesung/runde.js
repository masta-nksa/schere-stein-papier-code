// LÖSUNG zu runde.js (erst nach einem eigenen Versuch ansehen!)
// Eine Runde "Ich gegen den Computer". Wird von spiel.js aufgerufen, wenn man "Runde starten" drückt.
async function rundeSpielen() {
  anzeige.du = null;
  anzeige.gegner = null;
  meldung('');

  // Teil 1: Countdown
  for (const n of [3, 2, 1]) {
    anzeige.text = String(n);
    await warte(1000);
  }
  anzeige.text = '0';
  await warte(NACHFRIST_MS);                 // kurze Nachfrist, falls die Hand etwas spät kommt

  // Teil 2: Handzeichen erkennen
  const ich = handzeichenJetzt();            // häufigstes Handzeichen der letzten ca. 500 ms
  if (ich === null) {
    anzeige.text = '?';
    meldung('Nicht sicher erkannt (' + erklaereUnsicher() + '). Die Runde zählt nicht: zeige dein Handzeichen deutlich und starte nochmals.', true);
    return;
  }
  anzeige.du = ich;

  // Teil 3: Computer wählt, Ergebnis berechnen
  const computer = Math.floor(Math.random() * 3);
  anzeige.gegner = computer;
  const e = ergebnis(ich, computer);

  // Teil 4: Ergebnis und Punkte anzeigen
  if (e === 1) {
    anzeige.punkteDu++;
    anzeige.text = 'Sieg!';
  } else if (e === -1) {
    anzeige.punkteGegner++;
    anzeige.text = 'Verloren';
  } else {
    anzeige.text = 'Gleich';
  }
  meldung('Du: ' + NAMEN[ich] + ', Computer: ' + NAMEN[computer] + '.');
}
