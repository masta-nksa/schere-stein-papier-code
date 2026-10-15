// Schritt 2: Modell laden, erkanntes Handzeichen anzeigen, Knöpfe. Die Spiellogik einer Runde steht in runde.js.
const urlFeld = document.getElementById('modell-url');
const startKnopf = document.getElementById('start');
const rundeKnopf = document.getElementById('runde');
const nullenKnopf = document.getElementById('nullen');
const erkanntFeld = document.getElementById('erkannt');
const balkenBox = document.getElementById('balken');
const meldungFeld = document.getElementById('meldung');

let rundeLaeuft = false;

// Den Link merken, damit man ihn nach dem Neuladen nicht neu einfügen muss
try { urlFeld.value = localStorage.getItem('ssp-modell-url') || ''; } catch (e) { /* ohne Speicher geht es auch */ }

function meldung(text, istFehler) {
  meldungFeld.textContent = text;
  meldungFeld.className = 'status' + (istFehler ? ' fehler' : '');
}

function warte(ms) { return new Promise(ok => setTimeout(ok, ms)); }

// ---------- Kamera und Modell ----------
startKnopf.onclick = async () => {
  startKnopf.disabled = true;
  erkanntFeld.textContent = 'Modell wird geladen …';
  try {
    await erkennungStarten(urlFeld.value, document.getElementById('kamera'));
    try { localStorage.setItem('ssp-modell-url', urlFeld.value.trim()); } catch (e) { /* egal */ }
    rundeKnopf.disabled = false;
    nullenKnopf.disabled = false;
    meldung('Bereit. Drücke „Runde starten“ und zeige bei 0 dein Handzeichen.');
  } catch (e) {
    erkanntFeld.textContent = 'Fehler: ' + e.message + ' (Link korrekt? Kamera erlaubt? Seite über Live Server geöffnet?)';
    startKnopf.disabled = false;
  }
};

// Nach jedem Kamerabild: erkannte Klasse und Balken für alle Klassen anzeigen
beiVorhersage = (beste, alle) => {
  erkanntFeld.textContent = 'Erkannt: ' + beste.className + ' (' + Math.round(beste.probability * 100) + ' %)';
  if (balkenBox.children.length !== alle.length) {
    balkenBox.innerHTML = '';
    for (const v of alle) {
      const zeile = document.createElement('div');
      zeile.className = 'balken';
      zeile.innerHTML = '<span class="name"></span><span class="spur"><span class="fuell"></span></span>';
      zeile.querySelector('.name').textContent = v.className;
      balkenBox.appendChild(zeile);
    }
  }
  alle.forEach((v, i) => {
    balkenBox.children[i].querySelector('.fuell').style.width = Math.round(v.probability * 100) + '%';
  });
};

// ---------- Das Spiel ----------
rundeKnopf.onclick = async () => {
  if (rundeLaeuft) return;
  rundeLaeuft = true;
  rundeKnopf.disabled = true;
  try {
    await rundeSpielen();                    // deine Spiellogik steht in runde.js
  } catch (e) {
    meldung('Fehler in runde.js: ' + e.message + ' (Konsole mit F12 öffnen)', true);
    console.error(e);
  }
  rundeLaeuft = false;
  rundeKnopf.disabled = false;
};

nullenKnopf.onclick = () => {
  anzeige.punkteDu = 0;
  anzeige.punkteGegner = 0;
  anzeige.du = null;
  anzeige.gegner = null;
  anzeige.text = '';
};
