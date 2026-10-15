// Steuerung 3: Hand-Tracking mit ml5.handPose
// Das Modell ist fertig trainiert. Es liefert 21 Punkte (Keypoints) pro Hand.
// Wir nehmen die x-Position eines Punktes und lassen den Spieler dorthin laufen.

// Falls links und rechts vertauscht sind: auf true setzen.
const HAND_INVERT = false;

// Anteil des Kamerabilds links und rechts, der als Spielrand zählt (0.15 = 15 %). Grösser = weniger Weg nötig.
const HAND_RAND = 0.15;

// Welcher Handpunkt steuert? 0 = Handgelenk, 8 = Zeigefingerspitze, 9 = Basis des Mittelfingers
const PUNKT = 9;

let handModel = null, handVideo = null, handX = null, handSeen = false;

function handTargetX() {
  return HAND_INVERT ? W - handX : handX;
}

document.getElementById('hand-start').onclick = () => {
  try {
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

// Wird von ml5 bei jedem Kamerabild aufgerufen
function gotHands(results) {
  let seen = false;
  if (results && results.length > 0 && results[0].keypoints) {
    const kp = results[0].keypoints;
    const p = kp[PUNKT] || kp[0];
    // ml5 meldet x im Koordinatenraum des Video-Elements (hier 160 px), nicht der Kamera (z. B. 640 px)
    const vw = (handVideo && handVideo.elt && (handVideo.elt.width || handVideo.elt.videoWidth)) || 160;
    // Kamerabreite auf Spielbreite umrechnen; die äusseren Ränder des Bilds gelten als Spielrand
    handX = constrain(map(p.x / vw, HAND_RAND, 1 - HAND_RAND, 0, 1), 0, 1) * W;
    seen = true;
  } else {
    handX = null;
  }
  if (seen !== handSeen) setStatus(seen ? 'Hand erkannt.' : 'Keine Hand sichtbar.');
  handSeen = seen;
}

// Spieler läuft zur Handposition (kleine Toleranzzone, damit er nicht zittert)
function steuerungUpdate() {
  if (handX === null) { inputDir = 0; return; }
  const dx = handTargetX() - player.x;
  inputDir = abs(dx) < 12 ? 0 : (dx > 0 ? 1 : -1);
}

// Grüne Markierung zeigt, wo das Spiel deine Hand "sieht"
function steuerungZeichnen() {
  if (handX === null) return;
  const tx = handTargetX();
  stroke(34, 197, 94, 160);
  strokeWeight(2);
  line(tx, H - 60, tx, H);
  noStroke();
  fill(34, 197, 94);
  circle(tx, H - 60, 10);
}
