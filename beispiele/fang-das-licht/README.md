# Beispiel: Fang das Licht – ein Spiel, viele Steuerungen

Ein kleines p5.js-Spiel (gelbe Lichter fangen, rote Quadrate meiden). Das Spiel bleibt gleich, nur die Steuerung wechselt.
Ein guter Startpunkt für die Richtung **Spiele mit Gestensteuerung**.

| Schritt | Steuerung | Anleitung | Code |
|---|---|---|---|
| 1 | Tastatur | [Anleitung](anleitung/01-spiel-und-steuerung.md) | `schritte/01-tastatur/` |
| 2 | Teachable Machine (eigenes Modell) | [Anleitung](anleitung/02-teachable-machine.md) | `schritte/02-teachable-machine/` |
| 3 | ml5 handPose (fertiges Modell) | [Anleitung](anleitung/03-handpose-ml5.md) | `schritte/03-handpose/` |
| 4 | micro:bit oder ESP8266 per USB | [Anleitung](anleitung/04-usb-controller.md) | `schritte/04-usb-controller/` |

`demo/` enthält alle Steuerungen auf einer Seite.

## Starten
Den **ganzen Repo-Ordner** in VS Code öffnen, dann z. B. `schritte/01-tastatur/index.html` mit **Live Server** öffnen.
Kamera und USB brauchen Chrome oder Edge.

Hinweis: Der micro:bit-Controller in Schritt 4 ist in MakeCode-Python geschrieben, nicht in MicroPython wie die Programme im Ordner `microbit/`.
