# Schritt 3: Hand-Tracking mit ml5 (fertiges Modell)

**Code:** `schritte/03-handpose/` · **Dauer:** ca. 20 Minuten

## Worum geht es?
Diesmal trainierst du **nichts**. Das Modell `ml5.handPose` kennt Hände schon und liefert dir
**21 Punkte pro Hand** (Handgelenk, Fingergelenke, Fingerspitzen). Du schreibst die Logik, was mit diesen Punkten passiert.

## Teachable Machine oder ml5 handPose?
| | Teachable Machine (Schritt 2) | ml5 handPose (Schritt 3) |
|---|---|---|
| Training | Du trainierst mit eigenen Beispielen | Keines nötig |
| Ausgabe | Eine Klasse ("links", "rechts") | Koordinaten (x, y) für 21 Punkte |
| Gut für | Eigene, ungewöhnliche Dinge erkennen | Genaue Positionen und Bewegungen |
| Aufwand | Bilder aufnehmen | Etwas mehr Code schreiben |

Beides hat seinen Platz. Für "wo ist meine Hand?" ist handPose genauer. Für "ist das eine Faust oder ein Peace-Zeichen?" ist Training praktischer.

## Ausprobieren
1. `schritte/03-handpose/index.html` mit Live Server öffnen.
2. **Kamera + Hand-Modell starten** drücken, Kamera erlauben (der erste Start dauert ein paar Sekunden).
3. Halte eine Hand ins Bild. Der Spieler folgt ihr, eine grüne Markierung zeigt, wo das Spiel deine Hand sieht.

## Wie funktioniert der Code?
In `steuerung.js` liefert ml5 bei jedem Kamerabild eine Liste von Händen. Jede Hand hat `keypoints`.
Wir nehmen einen Punkt (`PUNKT`), rechnen seine x-Position auf die Spielbreite um und lassen den Spieler dorthin laufen.
Wichtig: ml5 meldet x im Koordinatenraum des Video-Elements (hier 160 px breit), nicht der Kamera (z. B. 640 px). Darum teilen wir durch `handVideo.elt.width`.
`HAND_RAND` legt fest, welcher Teil des Kamerabilds links und rechts als Spielrand zählt. So muss die Hand nicht ganz aus dem Bild.

## Aufgaben
1. Links und rechts vertauscht? Setze `HAND_INVERT` auf `true`.
2. Reicht dir der Weg der Hand nicht (oder ist er zu kurz)? Ändere `HAND_RAND` (z. B. `0.25` = weniger Weg, `0.05` = mehr Weg).
3. Ändere `PUNKT` auf `8` (Zeigefingerspitze) oder `0` (Handgelenk). Was fühlt sich besser an?
4. Der Spieler läuft nur links/rechts. Wie könntest du auch die **Höhe** der Hand nutzen? (Idee: schneller laufen, wenn die Hand höher ist.)
5. **Bonus:** Messe den Abstand zwischen Daumenspitze (Punkt 4) und Zeigefingerspitze (Punkt 8). Daraus kannst du ein "Pinch" machen, z. B. als Auslöser.

## Stolpersteine
| Problem | Lösung |
|---|---|
| Lädt lange | Beim ersten Start wird das Modell geladen. Ein paar Sekunden warten. |
| Keine Hand erkannt | Hand gut beleuchtet, ganz im Bild, Handfläche zur Kamera. |
| Spieler zittert | Toleranzzone in `steuerungUpdate()` vergrössern (die Zahl `12`). |

[Weiter zu Schritt 4: USB-Controller](04-usb-controller.md)
