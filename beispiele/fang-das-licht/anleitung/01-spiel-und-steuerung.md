# Schritt 1: Das Spiel und die Idee "Steuerung = eine Zahl"

**Code:** `schritte/01-tastatur/` · **Dauer:** ca. 20 Minuten

## Worum geht es?
Du startest mit einem fertigen kleinen Spiel. Gelbe Lichter fangen, rote Quadrate meiden. Wer drei Leben
verloren hat, ist raus. Das ist dein Spielplatz für die nächsten Schritte.

## Die wichtigste Idee
Der Spielkern (`spiel/spiel-kern.js`) weiss nicht, **womit** man spielt. Er schaut nur auf eine Variable:

```js
inputDir   // -1 = nach links, 0 = stehen bleiben, 1 = nach rechts
```

Jede Steuerung (Tastatur, Kamera, USB-Controller) hat nur eine Aufgabe: `inputDir` setzen.
Das ist alles. Deshalb können wir später die Steuerung austauschen, ohne das Spiel anzufassen.

Schau dir `schritte/01-tastatur/steuerung.js` an. Es sind nur wenige Zeilen.

## Aufgaben
Ändere die Werte im Block `CONFIG` ganz oben in `spiel/spiel-kern.js`. Speichern, der Browser lädt neu.

1. **Tempo:** Mach den Spieler schneller oder langsamer (`spielerTempo`).
2. **Schwierigkeit:** Lass mehr rote Hindernisse fallen (`anteilRot`) oder schneller (`fallTempoMin`, `fallTempoMax`).
3. **Aussehen:** Ändere die Farben (`farbeSpieler`, `farbeLicht`, `farbeHindernis`).
4. **Leben:** Mehr oder weniger Leben (`leben`). Wie fühlt sich das Spiel an?
5. **Eigene Regel (Bonus):** Ein goldenes Licht, das 5 Punkte gibt. Tipp: In `update()` steht, was beim Treffen passiert.

## Das solltest du am Ende erklären können
- Was macht `inputDir`?
- Wo im Code wird entschieden, ob ein Licht gefangen wurde?
- Was würdest du ändern, damit das Spiel schwerer wird?

[Weiter zu Schritt 2: Teachable Machine](02-teachable-machine.md)
