# Schritt 4: Steuerung mit micro:bit oder ESP8266 (USB-Controller)

**Code:** `schritte/04-usb-controller/` · **Dauer:** ca. 35 Minuten

## Worum geht es?
Dein Browser spricht direkt mit einem Mikrocontroller. Er schickt über USB ein Zeichen pro Zustand:

| Controller → Browser | Bedeutung |
|---|---|
| `L` | links gedrückt |
| `R` | rechts gedrückt |
| `S` | nichts gedrückt |

Und umgekehrt: `G` = Game Over (LED an), `N` = LED aus. Das Spiel bleibt exakt gleich, nur `inputDir` kommt jetzt aus echter Hardware.

## Variante A: micro:bit V2 (ohne Verdrahtung, am schnellsten)
1. Öffne [makecode.microbit.org](https://makecode.microbit.org), neues Projekt, oben auf **Python** umschalten.
2. Den Inhalt von `microbit_controller.py` einfügen und auf den micro:bit laden.
3. Taste **A** = links, Taste **B** = rechts. Beim Game Over erscheint ein trauriges Gesicht.
4. Bonus: `NEIGEN = True` setzen, dann steuerst du durch **Neigen** des micro:bit.

## Variante B: ESP8266 (NodeMCU) mit Tastern
Du brauchst: Steckbrett, 2 Taster, 1 LED, 1 Widerstand (ca. 220 Ω), Jumperkabel.

| Bauteil | Anschluss |
|---|---|
| Taster links | D1 und GND |
| Taster rechts | D2 und GND |
| LED (langes Bein) | über 220 Ω an D5 |
| LED (kurzes Bein) | GND |

1. Arduino-IDE: Board-Paket **esp8266** installieren, Board **NodeMCU 1.0 (ESP-12E Module)** wählen.
2. `esp8266_controller/esp8266_controller.ino` öffnen und hochladen.
3. **Serial Monitor schliessen**, sonst ist der Port belegt.

## Verbinden
1. `schritte/04-usb-controller/index.html` mit Live Server öffnen (**Chrome oder Edge**).
2. **Mit Controller verbinden** → Port wählen → los.

## Aufgaben
1. Drücke beide Tasten gleichzeitig. Was passiert, und warum?
2. Ändere im Controller-Programm, wie oft der Zustand gesendet wird.
3. **Bonus:** Lass den Controller einen Summer oder eine zweite LED bei jedem gefangenen Licht auslösen. Was müsste das Spiel dem Controller dafür schicken?

## Stolpersteine

| Problem | Lösung |
|---|---|
| Kein Port in der Liste | USB-Kabel mit Datenleitung? Treiber (CP210x oder CH340) installiert? |
| "Port belegt" | Serial Monitor schliessen. Bei micro:bit die MakeCode-Verbindung (WebUSB) trennen. |
| Board startet beim Verbinden neu | Normal. Zwei Sekunden warten. |
| ESP8266: komischer Text im Monitor | Baudrate auf **115200** stellen. |

[Zurück zur Übersicht](../README.md)
