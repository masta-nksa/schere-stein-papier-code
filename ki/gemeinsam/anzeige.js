// Spielfeld mit p5.js: links "Du", rechts der Gegner, in der Mitte Countdown oder Text.
// Die Hände sind dieselben 5x5-Bilder wie auf dem micro:bit (BILDER in logik.js).
// Die anderen Skripte ändern nur das Objekt `anzeige`, gezeichnet wird hier.
const anzeige = {
  du: null,            // 0, 1, 2 oder null (nichts zeigen)
  gegner: null,
  text: '',            // grosse Anzeige in der Mitte: "3", "Sieg!" usw.
  punkteDu: 0,
  punkteGegner: 0,
  nameGegner: 'Computer',
};

function setup() {
  const c = createCanvas(520, 230);
  c.parent('spielfeld');
  textAlign(CENTER, CENTER);
}

function draw() {
  background(255);
  textSize(16);
  noStroke();
  fill(60);
  text('Du  ' + anzeige.punkteDu, 100, 20);
  text(anzeige.nameGegner + '  ' + anzeige.punkteGegner, 420, 20);
  zeichneBild(anzeige.du, 40, 45);
  zeichneBild(anzeige.gegner, 360, 45);
  textSize(anzeige.text.length > 3 ? 26 : 56);
  fill(20);
  text(anzeige.text, 260, 120);
}

// Zeichnet ein 5x5-Bild aus BILDER; bei null ein leeres Raster
function zeichneBild(code, x0, y0) {
  const zeilen = code === null ? null : BILDER[code].split(':');
  const feld = 24;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const hell = zeilen ? Number(zeilen[y][x]) : 0;
      fill(hell > 0 ? color(220, 40, 40) : color(235));
      rect(x0 + x * feld, y0 + y * feld, feld - 3, feld - 3, 3);
    }
  }
  if (code !== null) {
    fill(60);
    textSize(16);
    text(NAMEN[code], x0 + 60, y0 + 140);
  }
}
