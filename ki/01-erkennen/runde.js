// Hier schreibst du die Spiellogik: eine Runde "Ich gegen den Computer".
// spiel.js ruft rundeSpielen() auf, wenn du "Runde starten" drückst. Arbeite die TODOs der Reihe nach ab
// und teste nach jedem Teil im Browser (Seite neu laden mit F5).
//
// Das ist schon da, du darfst es benutzen:
//   warte(ms)               wartet so viele Millisekunden (mit await davor)
//   anzeige.text            grosser Text in der Mitte des Spielfelds
//   anzeige.du / .gegner    Handzeichen auf dem Spielfeld: 0 = Stein, 1 = Papier, 2 = Schere (oder null)
//   anzeige.punkteDu / .punkteGegner
//   handzeichenJetzt()      0, 1, 2 oder null (null = nicht sicher erkannt)
//   ergebnis(ich, gegner)   1 = ich gewinne, 0 = unentschieden, -1 = ich verliere
//   NAMEN                   ['Stein', 'Papier', 'Schere']
//   meldung(text)           kleiner Text unter dem Spielfeld
async function rundeSpielen() {
  anzeige.du = null;
  anzeige.gegner = null;
  meldung('');

  // ---- Teil 1: Countdown ----
  // TODO 1: Zeige nacheinander "3", "2", "1" in anzeige.text. Zwischen den Zahlen wartest du eine Sekunde: await warte(1000);
  //         Tipp: eine for-Schleife über [3, 2, 1], dann musst du den Code nicht dreimal schreiben.


  anzeige.text = '0';
  await warte(NACHFRIST_MS);                 // kurze Nachfrist, falls die Hand etwas spät kommt

  // ---- Teil 2: Handzeichen erkennen ----
  // TODO 2: Ersetze null durch handzeichenJetzt().
  const ich = null;
  if (ich === null) {                        // nicht sicher erkannt: die Runde zählt nicht
    anzeige.text = '?';
    meldung('Nicht sicher erkannt (' + erklaereUnsicher() + '). Die Runde zählt nicht: zeige dein Handzeichen deutlich und starte nochmals.', true);
    return;
  }
  anzeige.du = ich;

  // ---- Teil 3: Computer wählt, Ergebnis berechnen ----
  // TODO 3: Der Computer wählt zufällig 0, 1 oder 2.  Tipp: Math.floor(Math.random() * 3)
  const computer = 0;
  anzeige.gegner = computer;
  // TODO 4: Berechne das Ergebnis mit ergebnis(ich, computer).
  const e = 0;

  // ---- Teil 4: Ergebnis und Punkte anzeigen ----
  // TODO 5: Wenn e === 1: anzeige.punkteDu um 1 erhöhen und anzeige.text = 'Sieg!'.
  //         Wenn e === -1: anzeige.punkteGegner um 1 erhöhen und anzeige.text = 'Verloren'.
  //         Sonst: anzeige.text = 'Gleich'.


  meldung('Du: ' + NAMEN[ich] + ', Computer: ' + NAMEN[computer] + '.');
}
