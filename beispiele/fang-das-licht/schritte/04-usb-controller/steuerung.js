// Steuerung 4: USB-Controller (micro:bit oder ESP8266) per Web Serial
// Protokoll (Textzeilen, 115200 Baud):
//   Controller -> Browser:  "L" links gedrückt, "R" rechts gedrückt, "S" nichts / beide
//   Browser -> Controller:  "G" Game Over (LED an), "N" LED aus
let serialPort = null, serialWriter = null;

async function espSend(ch) {
  if (!serialWriter) return;
  try { await serialWriter.write(new TextEncoder().encode(ch + '\n')); } catch (e) { /* ignorieren */ }
}

// Hooks vom Spielkern: dem Controller Bescheid geben
function onGameOver() { espSend('G'); }
function onSpielStart() { espSend('N'); }

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
        if (line === 'L') inputDir = -1;
        else if (line === 'R') inputDir = 1;
        else if (line === 'S') inputDir = 0;
      }
    }
  } catch (e) {
    setStatus('Serielle Verbindung getrennt.');
  }
}
