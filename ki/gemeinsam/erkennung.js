// Kamera + Teachable-Machine-Modell: erkennt laufend das Handzeichen.
// Jedes erkannte Bild wird in `proben` gemerkt. Bei 0 des Countdowns schaut handzeichenJetzt()
// auf die letzten ca. 500 ms zurück (siehe entscheide() in logik.js).
let modell = null, kamera = null, erkennungLaeuft = false;
let proben = [];                 // [{ t, klasse, p }, ...] die letzten Sekunden
let letzteVorhersage = [];       // alle Klassen mit Sicherheit, für die Balkenanzeige
let beiVorhersage = null;        // Funktion, die nach jedem Bild aufgerufen wird (optional)

// Modell und Kamera starten. url ist der Modell-Link von Teachable Machine (endet auf "/").
async function erkennungStarten(url, kameraBox) {
  url = url.trim();
  if (!url) throw new Error('Bitte zuerst den Modell-Link einfügen.');
  if (!url.endsWith('/')) url += '/';
  modell = await tmImage.load(url + 'model.json', url + 'metadata.json');
  kamera = new tmImage.Webcam(200, 200, true);       // true = gespiegelt
  await kamera.setup();
  await kamera.play();
  kameraBox.innerHTML = '';
  kameraBox.appendChild(kamera.canvas);
  if (!erkennungLaeuft) {
    erkennungLaeuft = true;
    requestAnimationFrame(erkennungSchleife);
  }
}

async function erkennungSchleife() {
  if (!erkennungLaeuft) return;
  kamera.update();
  const vorhersage = await modell.predict(kamera.canvas);
  const jetzt = performance.now();
  let beste = vorhersage[0];
  for (const v of vorhersage) if (v.probability > beste.probability) beste = v;
  proben.push({ t: jetzt, klasse: beste.className.trim().toLowerCase(), p: beste.probability });
  proben = proben.filter(pr => pr.t > jetzt - 3000);     // alte Bilder vergessen
  letzteVorhersage = vorhersage;
  if (beiVorhersage) beiVorhersage(beste, vorhersage);
  requestAnimationFrame(erkennungSchleife);
}

// Welches Handzeichen wurde in den letzten ca. 500 ms gezeigt? 0, 1, 2 oder null (nicht sicher)
function handzeichenJetzt() {
  if (!erkennungLaeuft) return null;
  return entscheide(proben, performance.now());
}

// Erklärt in einem Satz, warum "nicht sicher" herauskam (für das Log)
function erklaereUnsicher() {
  if (!erkennungLaeuft) return 'Kamera und Modell sind nicht gestartet';
  const a = analysiere(proben, performance.now());
  if (a.gesamt === 0) return 'keine Kamerabilder in den letzten 500 ms (Tab im Vordergrund? Fenster verdeckt?)';
  if (a.gueltig < MIN_PROBEN) {
    return 'nur ' + a.gueltig + ' von ' + a.gesamt + ' Bildern sicher genug (mind. ' + MIN_PROBEN + ', Schwelle ' + Math.round(SCHWELLE * 100) + ' %)';
  }
  if (a.code !== null) {            // die Kamera hätte etwas erkannt: dann fehlt die Abfrage im Programm
    return 'die Kamera sieht ' + NAMEN[a.code] + ', aber das Programm hat sie nicht gefragt (handzeichenJetzt() in runde.js?)';
  }
  return 'kein klarer Sieger: ' + JSON.stringify(a.zaehler);
}
