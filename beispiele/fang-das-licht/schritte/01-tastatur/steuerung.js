// Steuerung 1: Tastatur
// Wird vom Spielkern in jedem Frame aufgerufen und setzt nur inputDir.
function steuerungUpdate() {
  let d = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) d -= 1;   // Pfeil links oder A
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) d += 1;  // Pfeil rechts oder D
  inputDir = d;
}
