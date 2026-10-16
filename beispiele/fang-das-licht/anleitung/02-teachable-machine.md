# Schritt 2: Steuerung mit eigenem KI-Modell (Teachable Machine)

**Code:** `schritte/02-teachable-machine/` · **Dauer:** ca. 35 bis 45 Minuten

## Worum geht es?
Du trainierst ein KI-Modell, das auf der Kamera erkennt, ob du die Hand **links**, **rechts** oder **nirgends** hältst.
Das Modell steuert dann das Spiel.

## So funktioniert KI-Training (in einem Satz)
Du zeigst dem Modell viele Beispiele pro Klasse. Daraus lernt es, neue Bilder einer Klasse zuzuordnen.

## Modell trainieren
1. Öffne [teachablemachine.withgoogle.com](https://teachablemachine.withgoogle.com) → **Bildprojekt** → **Standard-Bildmodell**.
2. Lege **drei Klassen** an und benenne sie genau so: `links`, `rechts`, `nichts`.
   (Der Code erkennt die Wörter "links" und "rechts" im Namen.)
3. Nimm pro Klasse mit der Webcam etwa **50 Bilder** auf:
   - `links`: Hand auf der linken Seite des Bildes
   - `rechts`: Hand auf der rechten Seite
   - `nichts`: keine Hand im Bild, du schaust normal in die Kamera
4. Klicke **Modell trainieren** und warte.
5. Teste im Vorschaufenster, ob es richtig erkennt.
6. **Modell exportieren** → Tab **Tensorflow.js** → **Modell hochladen** → den **Link kopieren**.

## Im Spiel einsetzen
1. `schritte/02-teachable-machine/index.html` mit Live Server öffnen.
2. Den Link ins Feld einfügen (er endet auf `/`).
3. **Kamera + Modell starten** drücken, Kamera erlauben.
4. Spiele mit der Hand.

## Gute Trainingsdaten
Wenn das Modell Fehler macht, liegt es fast immer an den Beispielen:
- Ändere zwischendurch **Abstand, Winkel und Handhaltung**.
- Nimm auch Bilder mit **anderem Licht und Hintergrund** auf.
- Mehr Beispiele helfen mehr als länger trainieren.

## Aufgaben
1. Teste dein Modell vor einem **anderen Hintergrund**. Was passiert?
2. Verbessere es mit neuen Beispielen und trainiere neu.
3. Füge eine vierte Klasse hinzu. Was könnte sie tun? (Tipp: `classToDir()` in `steuerung.js`.)
4. Schau in `steuerung.js`: Ab welcher Sicherheit (`probability`) reagiert das Spiel? Was ändert sich bei einem anderen Wert?

## Stolpersteine

| Problem | Lösung |
|---|---|
| "Fehler: Failed to fetch" | Link kopieren, der auf `/` endet. Modell hochgeladen? |
| Spieler reagiert nie | Klassennamen enthalten "links"/"rechts"? Bildprojekt gewählt (kein Pose-Projekt)? |
| Kamera startet nicht | Über Live Server öffnen, Kamera erlauben. |

[Weiter zu Schritt 3: ml5 handPose](03-handpose-ml5.md)
