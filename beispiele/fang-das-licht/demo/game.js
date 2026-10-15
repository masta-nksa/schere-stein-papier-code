// ==== Fang das Licht – ein Spiel, vier Steuerungen ====
// Alle Eingaben liefern nur eine Zahl: inputDir = -1 (links), 0 (stop), 1 (rechts).
// Das Spiel selbst weiss nicht, woher die Zahl kommt.

const W = 640, H = 480;

const LABELS = { key: 'Tastatur', gest: 'Geste (TM)', hand: 'Hand (ml5)', esp: 'USB-Controller' };
const MODES = ['key', 'gest', 'hand', 'esp'];

// Falls links/rechts bei der Handsteuerung vertauscht sind: auf true setzen.
const HAND_INVERT = false;
// Anteil des Kamerabilds links und rechts, der als Spielrand zählt (0.15 = 15 %). Grösser = weniger Weg nötig.
const HAND_RAND = 0.15;

let mode = 'key';      // 'key' | 'gest' | 'hand' | 'esp'
let inputDir = 0;      // wird von der aktiven Steuerung gesetzt

// --- Spielzustand ---
let player, items, score, lives, over, spawnTimer;

function resetGame() {
  player = { x: W / 2, y: H - 30, w: 90, h: 16, speed: 7 };
  items = [];
  score = 0;
  lives = 3;
  over = false;
  spawnTimer = 0;
  espSend('N'); // LED aus
}

function setup() {
  const c = createCanvas(W, H);
  c.parent('game-holder');
  resetGame();
}

function draw() {
  background(20, 22, 30);

  if (mode === 'key') {
    let d = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) d -= 1;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) d += 1;
    inputDir = d;
  } else if (mode === 'hand') {
    if (handX === null) {
      inputDir = 0;
    } else {
      const dx = handTargetX() - player.x;
      inputDir = abs(dx) < 12 ? 0 : (dx > 0 ? 1 : -1);
    }
  }

  if (!over) update();
  render();
}

function update() {
  player.x = constrain(player.x + inputDir * player.speed, player.w / 2, W - player.w / 2);

  spawnTimer--;
  if (spawnTimer <= 0) {
    const bad = random() < 0.25;
    items.push({ x: random(20, W - 20), y: -10, r: 12, vy: random(2, 3.5) + score * 0.03, bad });
    spawnTimer = max(18, 55 - score);
  }

  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.y += it.vy;
    const hit = it.y + it.r >= player.y && it.y - it.r <= player.y + player.h &&
                abs(it.x - player.x) <= player.w / 2 + it.r * 0.5;
    if (hit) {
      if (it.bad) lives--; else score++;
      items.splice(i, 1);
    } else if (it.y > H + 20) {
      if (!it.bad) lives--;   // Licht verpasst
      items.splice(i, 1);
    }
  }

  if (lives <= 0) {
    over = true;
    espSend('G'); // LED an
  }
}

function render() {
  noStroke();
  for (const it of items) {
    if (it.bad) { fill(239, 68, 68); rectMode(CENTER); rect(it.x, it.y, it.r * 2, it.r * 2); }
    else { fill(250, 204, 21); circle(it.x, it.y, it.r * 2); }
  }
  rectMode(CENTER);
  fill(59, 130, 246);
  rect(player.x, player.y + player.h / 2, player.w, player.h, 6);

  // Rückmeldung zur erkannten Hand (nur im Hand-Modus)
  if (mode === 'hand' && handX !== null) {
    const tx = handTargetX();
    stroke(34, 197, 94, 160);
    strokeWeight(2);
    line(tx, H - 60, tx, H);
    noStroke();
    fill(34, 197, 94);
    circle(tx, H - 60, 10);
  }

  fill(232);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text('Punkte: ' + score + '   Leben: ' + lives, 12, 10);
  textAlign(RIGHT, TOP);
  text('Steuerung: ' + LABELS[mode], W - 12, 10);

  if (over) {
    fill(0, 0, 0, 170);
    rectMode(CORNER);
    rect(0, 0, W, H);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(36);
    text('Game Over – ' + score + ' Punkte', W / 2, H / 2 - 12);
    textSize(16);
    text('Leertaste für Neustart', W / 2, H / 2 + 28);
  }
}

function keyPressed() {
  if (key === ' ') {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT') return;
    resetGame();
    return false;
  }
}

// ==== Modus-Umschalter ====
function setStatus(t) { document.getElementById('status').textContent = t; }

function setMode(m) {
  mode = m;
  inputDir = 0;
  for (const id of MODES) {
    document.getElementById('m-' + id).classList.toggle('active', id === m);
    document.getElementById('s-' + id).classList.toggle('show', id === m);
  }
  setStatus('Modus: ' + LABELS[m]);
}

for (const id of MODES) document.getElementById('m-' + id).onclick = () => setMode(id);

// ==== Steuerung 2: Geste mit Teachable Machine ====
// Das Modell läuft in tm.html (iframe) und meldet per postMessage zurück: { dir, text } oder { status }.
let tmFrame = null;

document.getElementById('tm-start').onclick = () => {
  const url = document.getElementById('tm-url').value.trim();
  if (!url) { setStatus('Bitte zuerst den Modell-Link einfügen.'); return; }
  const box = document.getElementById('webcam-container');
  box.innerHTML = '';
  tmFrame = document.createElement('iframe');
  tmFrame.allow = 'camera';
  tmFrame.src = 'tm.html';
  box.appendChild(tmFrame);
  setStatus('Teachable Machine wird gestartet …');
  window.tmUrl = url;
};

window.addEventListener('message', (ev) => {
  if (ev.origin !== location.origin || !ev.data || ev.data.from !== 'tm') return;
  const d = ev.data;
  if (d.ready) {
    tmFrame.contentWindow.postMessage({ cmd: 'start', url: window.tmUrl }, location.origin);
  } else if (d.status) {
    setStatus(d.status);
  } else if (mode === 'gest') {
    inputDir = d.dir;
    setStatus(d.text);
  }
});

// ==== Steuerung 3: Handtracking mit ml5.handPose (kein Training nötig) ====
// ml5 wird erst hier nachgeladen. Teachable Machine läuft getrennt im iframe (tm.html),
// damit sich die beiden tfjs-Versionen nicht beissen.
let handModel = null, handVideo = null, handX = null, handSeen = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Script nicht ladbar: ' + src));
    document.head.appendChild(s);
  });
}

function handTargetX() {
  return HAND_INVERT ? W - handX : handX;
}

document.getElementById('hand-start').onclick = async () => {
  try {
    setStatus('ml5 wird geladen …');
    if (typeof ml5 === 'undefined') await loadScript('https://unpkg.com/ml5@1/dist/ml5.min.js');
    setStatus('Hand-Modell wird geladen (kann einige Sekunden dauern) …');
    handVideo = createCapture(VIDEO);
    handVideo.size(160, 120);
    handVideo.parent('hand-container');
    handModel = ml5.handPose({ flipped: true }, () => {
      handModel.detectStart(handVideo, gotHands);
      setStatus('Bereit. Halte eine Hand ins Kamerabild und bewege sie links/rechts.');
    });
  } catch (e) {
    setStatus('Fehler: ' + e.message);
  }
};

function gotHands(results) {
  let seen = false;
  if (results && results.length > 0 && results[0].keypoints) {
    const kp = results[0].keypoints;
    const p = kp[9] || kp[0];          // 9 = Basis des Mittelfingers (ruhiger als die Fingerspitze)
    // ml5 meldet x im Koordinatenraum des Video-Elements (hier 160 px), nicht der Kamera (z. B. 640 px)
    const vw = (handVideo && handVideo.elt && (handVideo.elt.width || handVideo.elt.videoWidth)) || 160;
    // Äussere Ränder des Kamerabilds gelten als Spielrand: man muss nicht ganz aus dem Bild
    handX = constrain(map(p.x / vw, HAND_RAND, 1 - HAND_RAND, 0, 1), 0, 1) * W;
    seen = true;
  } else {
    handX = null;
  }
  if (mode === 'hand' && seen !== handSeen) {
    setStatus(seen ? 'Hand erkannt.' : 'Keine Hand sichtbar.');
  }
  handSeen = seen;
}

// ==== Steuerung 4: USB-Controller (ESP8266 oder micro:bit) per Web Serial ====
// Protokoll (Zeilen mit \n, 115200 Baud):
//   Controller -> Browser:  'L' links gedrückt, 'R' rechts gedrückt, 'S' nichts / beide
//   Browser -> Controller:  'G' Game Over (LED an), 'N' LED aus
let serialPort = null, serialWriter = null;

async function espSend(ch) {
  if (!serialWriter) return;
  try { await serialWriter.write(new TextEncoder().encode(ch + '\n')); } catch (e) { /* ignorieren */ }
}

document.getElementById('esp-connect').onclick = async () => {
  if (!('serial' in navigator)) {
    setStatus('Web Serial gibt es nur in Chrome oder Edge.');
    return;
  }
  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 115200 });
    serialWriter = serialPort.writable.getWriter();
    setStatus('Verbunden. Taster drücken (nach einem Reset kurz warten).');
    readSerialLoop();
  } catch (e) {
    setStatus('Verbindung fehlgeschlagen: ' + e.message);
  }
};

async function readSerialLoop() {
  const decoder = new TextDecoderStream();
  serialPort.readable.pipeTo(decoder.writable).catch(() => {});
  const reader = decoder.readable.getReader();
  let buf = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (mode !== 'esp') continue;
        if (line === 'L') inputDir = -1;
        else if (line === 'R') inputDir = 1;
        else if (line === 'S') inputDir = 0;
      }
    }
  } catch (e) {
    setStatus('Serielle Verbindung getrennt.');
  }
}
