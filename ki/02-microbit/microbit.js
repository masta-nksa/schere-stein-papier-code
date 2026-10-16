// Schritte 3 und 4: Browser <-> micro:bit per Web Serial (115200 Baud, Textzeilen mit \n)
// Protokoll (siehe logik.js und Etappe 2):
//   micro:bit -> Browser:  C3 C2 C1 | ? | R <ich> <gegner> <ergebnis> | P <ich> <gegner> | X
//   Browser -> micro:bit:  G0 G1 G2 | G-
const urlFeld = document.getElementById('modell-url');
const startKnopf = document.getElementById('start');
const erkanntFeld = document.getElementById('erkannt');
const verbindenKnopf = document.getElementById('verbinden');
const trennenKnopf = document.getElementById('trennen');
const usbStatus = document.getElementById('usb-status');
const meldungFeld = document.getElementById('meldung');
const logBox = document.getElementById('log');

let port = null, schreiber = null, leser = null;
const zeilen = new ZeilenPuffer();

anzeige.nameGegner = 'Gegner';
try { urlFeld.value = localStorage.getItem('ssp-modell-url') || ''; } catch (e) { /* ohne Speicher geht es auch */ }

function meldung(text, istFehler) {
  meldungFeld.textContent = text;
  meldungFeld.className = 'status' + (istFehler ? ' fehler' : '');
}

// ---------- Log: zeigt, was über das Kabel geht ----------
// art: 'ein' (vom micro:bit), 'aus' (an den micro:bit), 'unbekannt', 'info'
function logZeile(art, text, erklaerung) {
  const zeile = document.createElement('div');
  zeile.className = art;
  const pfeil = art === 'ein' ? '← ' : art === 'aus' ? '→ ' : '  ';
  zeile.textContent = pfeil + text.padEnd(10) + (erklaerung ? '  ' + erklaerung : '');
  logBox.appendChild(zeile);
  while (logBox.children.length > 200) logBox.removeChild(logBox.firstChild);
  logBox.scrollTop = logBox.scrollHeight;
}

// ---------- Kamera und Modell ----------
startKnopf.onclick = async () => {
  startKnopf.disabled = true;
  erkanntFeld.textContent = 'Modell wird geladen …';
  try {
    await erkennungStarten(urlFeld.value, document.getElementById('kamera'));
    try { localStorage.setItem('ssp-modell-url', urlFeld.value.trim()); } catch (e) { /* egal */ }
  } catch (e) {
    erkanntFeld.textContent = 'Fehler: ' + e.message + ' (Link korrekt? Kamera erlaubt? Seite über Live Server geöffnet?)';
    startKnopf.disabled = false;
  }
};

beiVorhersage = (beste) => {
  erkanntFeld.textContent = 'Erkannt: ' + beste.className + ' (' + Math.round(beste.probability * 100) + ' %)';
};

// ---------- USB-Verbindung ----------
verbindenKnopf.onclick = async () => {
  if (!('serial' in navigator)) {
    usbStatus.textContent = 'Web Serial gibt es nur in Chrome oder Edge.';
    usbStatus.className = 'status fehler';
    return;
  }
  try {
    port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0d28 }] });   // 0x0d28 = micro:bit
    await port.open({ baudRate: 115200 });
  } catch (e) {
    port = null;
    usbStatus.className = 'status fehler';
    if (e.name === 'NotFoundError') usbStatus.textContent = 'Kein micro:bit ausgewählt.';
    else usbStatus.textContent = 'Port nicht verfügbar (' + e.name + '). Ist der Python-Editor noch verbunden? Dort „Disconnect“ drücken oder den Tab schliessen.';
    return;
  }
  schreiber = port.writable.getWriter();
  verbindenKnopf.disabled = true;
  trennenKnopf.disabled = false;
  usbStatus.className = 'status';
  usbStatus.textContent = 'Verbunden. Drücke Taste A auf dem micro:bit.';
  logZeile('info', 'verbunden', '(115200 Baud)');
  leseSchleife();
};

trennenKnopf.onclick = () => { if (leser) leser.cancel(); };    // beendet die Lese-Schleife, die dann alles schliesst

async function leseSchleife() {
  const decoder = new TextDecoder();
  try {
    leser = port.readable.getReader();
    while (true) {
      const { value, done } = await leser.read();
      if (done) break;
      for (const z of zeilen.push(decoder.decode(value, { stream: true }))) zeileVerarbeiten(z);
    }
  } catch (e) {
    logZeile('info', 'Verbindung unterbrochen', e.message);
  }
  // Aufräumen: danach kann der Python-Editor den micro:bit wieder benutzen
  try { leser.releaseLock(); } catch (e) { /* schon frei */ }
  try { schreiber.releaseLock(); } catch (e) { /* schon frei */ }
  try { await port.close(); } catch (e) { /* schon zu */ }
  leser = null; schreiber = null; port = null;
  verbindenKnopf.disabled = false;
  trennenKnopf.disabled = true;
  usbStatus.textContent = 'Nicht verbunden.';
  logZeile('info', 'getrennt', '');
}

async function sendeAnMicrobit(text) {
  if (!schreiber) return;
  try { await schreiber.write(new TextEncoder().encode(text)); }
  catch (e) { logZeile('info', 'Senden fehlgeschlagen', e.message); }
}

// ---------- Eine Zeile vom micro:bit verarbeiten ----------
function zeileVerarbeiten(zeile) {
  const m = parseVonMicrobit(zeile);
  if (m === null) {
    logZeile('unbekannt', zeile, '(unbekannte Zeile, ignoriert)');
    return;
  }

  if (m.typ === 'C') {
    logZeile('ein', zeile, 'Countdown: ' + m.n);
    anzeige.du = null;
    anzeige.gegner = null;
    anzeige.text = String(m.n);
    meldung('');
  } else if (m.typ === '?') {
    logZeile('ein', zeile, 'Der micro:bit fragt nach deinem Handzeichen');
    anzeige.text = '0';
    if (!erkennungLaeuft) meldung('Kamera und Modell sind noch nicht gestartet.', true);
    // Kurze Nachfrist, falls die Hand etwas spät kommt. Der micro:bit wartet bis zu 3 Sekunden.
    setTimeout(() => {
      const code = handzeichenJetzt();                  // häufigstes Handzeichen der letzten ca. 500 ms
      const antwort = formatAnMicrobit(code);
      sendeAnMicrobit(antwort);
      logZeile('aus', antwort.trim(), code === null ? 'nicht sicher: ' + erklaereUnsicher() : 'Handzeichen: ' + NAMEN[code]);
      anzeige.du = code;
    }, NACHFRIST_MS);
  } else if (m.typ === 'R') {
    const urteil = m.ergebnis === 1 ? 'du gewinnst' : m.ergebnis === -1 ? 'du verlierst' : 'unentschieden';
    logZeile('ein', zeile, 'Du: ' + NAMEN[m.ich] + ', Gegner: ' + NAMEN[m.gegner] + ' → ' + urteil);
    anzeige.du = m.ich;
    anzeige.gegner = m.gegner;
    anzeige.text = m.ergebnis === 1 ? 'Sieg!' : m.ergebnis === -1 ? 'Verloren' : 'Gleich';
  } else if (m.typ === 'P') {
    logZeile('ein', zeile, 'Punkte: ' + m.ich + ' zu ' + m.gegner);
    anzeige.punkteDu = m.ich;
    anzeige.punkteGegner = m.gegner;
  } else if (m.typ === 'X') {
    logZeile('ein', zeile, 'Runde abgebrochen');
    anzeige.text = 'Nochmal!';
    meldung('Die Runde zählt nicht (nicht sicher erkannt oder keine Antwort). Drücke Taste A noch einmal.', true);
  }
}
