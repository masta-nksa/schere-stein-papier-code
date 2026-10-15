# Fang das Licht – ein Spiel, vier Steuerungen

Gelbe Lichter fangen, rote Quadrate meiden. Verpasste Lichter und rote Treffer kosten Leben.

## Starten
- In VS Code: Ordner öffnen, Rechtsklick auf `index.html` → **Open with Live Server**
- Oder über GitHub Pages (https). Kamera und Web Serial brauchen https oder localhost.
- Browser: **Chrome oder Edge** (Web Serial gibt es sonst nicht).

## Die vier Steuerungen

### 1. Tastatur
Pfeiltasten oder A/D. Leertaste = Neustart.

### 2. Geste (Teachable Machine) – eigenes Modell trainieren
1. https://teachablemachine.withgoogle.com → *Bildprojekt* → *Standard-Bildmodell*
2. Drei Klassen anlegen: `links`, `rechts`, `nichts` (Namen müssen "links" bzw. "rechts" enthalten)
3. Pro Klasse ca. 50 Bilder aufnehmen (z. B. Hand links / Hand rechts / keine Hand)
4. *Modell trainieren* → *Modell exportieren* → *Hochladen (teilbarer Link)*
5. Link kopieren, im Spiel unter "Geste (TM)" einfügen, Kamera erlauben

In der Demo ist schon ein fertiges Modell eingetragen (`https://teachablemachine.withgoogle.com/models/cNLuagAc0/`, Klassen `links`, `rechts`, `nichts`). Das Feld lässt sich überschreiben.

### 3. Hand (ml5.handPose) – fertiges Modell, kein Training
1. Im Spiel "Hand (ml5)" → *Kamera + Hand-Modell starten*, Kamera erlauben (erster Start kann einige Sekunden dauern)
2. Hand ins Bild halten: der Spieler folgt der Hand links/rechts (grüne Markierung im Spiel)
3. Falls links/rechts vertauscht ist: in `game.js` `HAND_INVERT = true` setzen
4. Die Modi lassen sich frei wechseln, ein Neuladen ist nicht nötig: Teachable Machine läuft getrennt in `tm.html` (iframe), weil sich die tfjs-Versionen von TM und ml5 sonst beissen

Unterschied zu Teachable Machine: Hier gibt es nichts zu trainieren. Das Modell liefert 21 Handpunkte (Keypoints), und wir schreiben selbst die Logik darüber.

### 4. USB-Controller (ESP8266 oder micro:bit)
- **ESP8266:** Firmware `../schritte/04-usb-controller/esp8266_controller/esp8266_controller.ino` flashen (Board: NodeMCU 1.0, Baudrate 115200). Taster links an D1, rechts an D2, LED (mit Vorwiderstand) an D5, jeweils gegen GND.
- **micro:bit V2:** `../schritte/04-usb-controller/microbit_controller.py` in MakeCode (Python) einfügen und laden. Taste A = links, B = rechts.
- Im Spiel "USB-Controller" → *Verbinden* → Port wählen
- Serieller Monitor der Arduino-IDE bzw. MakeCode-WebUSB-Verbindung muss geschlossen sein, sonst ist der Port belegt

## Stolpersteine
- Treiber (CH340 oder CP210x) auf Schulgeräten testen
- Nach dem Verbinden startet das Board teils neu: 2 Sekunden warten
- Kamera-Zugriff geht nicht über `file://`
