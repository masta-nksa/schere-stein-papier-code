// Steuerung 2: Teachable Machine (eigenes Bildmodell)
// Das Modell erkennt, welche Klasse die Kamera gerade sieht.
// Wir übersetzen den Klassennamen in eine Richtung und setzen damit inputDir.
let tmModel = null, tmWebcam = null, tmRunning = false;

function classToDir(name) {
  const n = name.toLowerCase();
  if (n.includes('links') || n.includes('left')) return -1;
  if (n.includes('rechts') || n.includes('right')) return 1;
  return 0;                      // alles andere (z. B. "nichts") = stehen bleiben
}

document.getElementById('tm-start').onclick = async () => {
  let url = document.getElementById('tm-url').value.trim();
  if (!url) { setStatus('Bitte zuerst den Modell-Link einfügen.'); return; }
  if (!url.endsWith('/')) url += '/';
  try {
    setStatus('Modell wird geladen …');
    tmModel = await tmImage.load(url + 'model.json', url + 'metadata.json');
    tmWebcam = new tmImage.Webcam(200, 200, true);   // true = gespiegelt
    await tmWebcam.setup();
    await tmWebcam.play();
    const box = document.getElementById('webcam-container');
    box.innerHTML = '';
    box.appendChild(tmWebcam.canvas);
    tmRunning = true;
    setStatus('Kamera läuft. Zeige links / rechts / nichts.');
    requestAnimationFrame(tmLoop);
  } catch (e) {
    setStatus('Fehler: ' + e.message + ' (Link korrekt? Kamera erlaubt?)');
  }
};

async function tmLoop() {
  if (!tmRunning) return;
  tmWebcam.update();
  const preds = await tmModel.predict(tmWebcam.canvas);
  let best = preds[0];
  for (const p of preds) if (p.probability > best.probability) best = p;
  // Nur reagieren, wenn sich das Modell einigermassen sicher ist
  inputDir = best.probability > 0.7 ? classToDir(best.className) : 0;
  setStatus('Erkannt: ' + best.className + ' (' + Math.round(best.probability * 100) + ' %)');
  requestAnimationFrame(tmLoop);
}
