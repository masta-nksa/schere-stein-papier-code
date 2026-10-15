// ==== Spielkern "Fang das Licht" ====
// Dieses Spiel kennt keine Steuerung. Eine Steuerung muss nur eines tun:
//   inputDir setzen:  -1 = nach links,  0 = stehen bleiben,  1 = nach rechts
//
// Optionale Hooks (die Steuerung definiert sie bei Bedarf in steuerung.js):
//   steuerungUpdate()    wird in jedem Frame aufgerufen
//   steuerungZeichnen()  zusätzliche Zeichnung über dem Spiel
//   onSpielStart()       beim Start und bei jedem Neustart
//   onGameOver()         wenn die Leben aufgebraucht sind

const W = 640, H = 480;

// Hier kannst du das Spiel verändern (Aufgabe in Lektion 1):
const CONFIG = {
  spielerBreite: 90,
  spielerTempo: 7,
  leben: 3,
  anteilRot: 0.25,        // Anteil roter Hindernisse (0 bis 1)
  fallTempoMin: 2,
  fallTempoMax: 3.5,
  farbeSpieler: [59, 130, 246],
  farbeLicht: [250, 204, 21],
  farbeHindernis: [239, 68, 68],
};

let inputDir = 0;         // wird von der Steuerung gesetzt
let player, items, score, lives, over, spawnTimer;

function resetGame() {
  player = { x: W / 2, y: H - 30, w: CONFIG.spielerBreite, h: 16, speed: CONFIG.spielerTempo };
  items = [];
  score = 0;
  lives = CONFIG.leben;
  over = false;
  spawnTimer = 0;
  if (typeof onSpielStart === 'function') onSpielStart();
}

function setup() {
  const c = createCanvas(W, H);
  c.parent('game-holder');
  resetGame();
}

function draw() {
  background(20, 22, 30);
  if (typeof steuerungUpdate === 'function') steuerungUpdate();
  if (!over) update();
  render();
  if (typeof steuerungZeichnen === 'function') steuerungZeichnen();
}

function update() {
  player.x = constrain(player.x + inputDir * player.speed, player.w / 2, W - player.w / 2);

  spawnTimer--;
  if (spawnTimer <= 0) {
    const bad = random() < CONFIG.anteilRot;
    items.push({
      x: random(20, W - 20), y: -10, r: 12,
      vy: random(CONFIG.fallTempoMin, CONFIG.fallTempoMax) + score * 0.03,
      bad,
    });
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
    if (typeof onGameOver === 'function') onGameOver();
  }
}

function render() {
  noStroke();
  rectMode(CENTER);
  for (const it of items) {
    if (it.bad) { fill(...CONFIG.farbeHindernis); rect(it.x, it.y, it.r * 2, it.r * 2); }
    else { fill(...CONFIG.farbeLicht); circle(it.x, it.y, it.r * 2); }
  }
  fill(...CONFIG.farbeSpieler);
  rect(player.x, player.y + player.h / 2, player.w, player.h, 6);

  fill(232);
  textSize(18);
  textAlign(LEFT, TOP);
  text('Punkte: ' + score + '   Leben: ' + lives, 12, 10);

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
    if (tag === 'INPUT') return;   // Leertaste in Eingabefeldern nicht abfangen
    resetGame();
    return false;
  }
}

function setStatus(t) {
  const el = document.getElementById('status');
  if (el) el.textContent = t;
}
