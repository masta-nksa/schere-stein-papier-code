# Lektion 2, Schritt 3: Schere-Stein-Papier gegen den micro:bit, dein Handzeichen kommt vom Browser (VORLAGE)
# Du schreibst die Funktion runde_spielen(). Arbeite die TODOs der Reihe nach ab und lade nach jedem Teil
# das Programm auf den micro:bit. Alles andere (USB, Protokoll, Lesen der Antwort) ist schon fertig.
# Hängst du fest? Die Lösung ist 06_ssp_ki.py (erst nach einem eigenen Versuch ansehen).
#
# Protokoll (Textzeilen mit \n, 115200 Baud):
#   micro:bit -> Browser:  "C3" "C2" "C1" Countdown | "?" Handzeichen anfordern
#                          "R <du> <micro:bit> <ergebnis>"  Resultat (1 = du gewinnst, 0 = unentschieden, -1 = du verlierst)
#                          "P <du> <micro:bit>"  Punkte | "X"  Runde abgebrochen
#   Browser -> micro:bit:  "G0" Stein, "G1" Papier, "G2" Schere, "G-" nicht sicher erkannt
#
# Schon da, du darfst es benutzen:
#   senden("C3")               schickt eine Zeile an den Browser
#   handzeichen_holen()        fragt den Browser, gibt 0, 1, 2 (Handzeichen), -1 (nicht sicher) oder None (keine Antwort) zurück
#   ergebnis(ich, gegner)      1 = ich gewinne, 0 = unentschieden, -1 = ich verliere
#   BILDER[0..2]               Stein, Papier, Schere für das Display
#   ampel(r, g, b, anzahl)     Zusatz ★: Neopixel leuchten lassen (Farben 0 bis 255)
from microbit import *
import random
import music

uart.init(baudrate=115200)    # USB-Verbindung zum Computer

# Zusatz ★: Neopixel-Ampel. Datenleitung an Pin 1, dazu 3V und GND (nicht Pin 0: den braucht der Ton).
N_PIXEL = 0                   # Anzahl Neopixel (höchstens 8 am 3V-Anschluss), 0 = keine angeschlossen
if N_PIXEL > 0:
    import neopixel
    streifen = neopixel.NeoPixel(pin1, N_PIXEL)

STEIN = Image("00000:09990:09990:09990:00000")
PAPIER = Image("99999:90009:90009:90009:99999")
SCHERE = Image("99009:99090:00900:99090:99009")
BILDER = [STEIN, PAPIER, SCHERE]

ANTWORT_MS = 3000             # so lange wartet der micro:bit auf den Browser

punkte_ich = 0                # deine Punkte
punkte_computer = 0           # Punkte des micro:bit
puffer = ""                   # angefangene Zeile vom Browser


def ergebnis(ich, gegner):
    # 1 = gewonnen, 0 = unentschieden, -1 = verloren
    d = (ich - gegner) % 3
    if d == 0:
        return 0
    if d == 1:
        return 1
    return -1


def ampel(r, g, b, anzahl=None):
    # Die ersten `anzahl` Neopixel leuchten in dieser Farbe (0 bis 255 pro Farbe), die anderen sind aus.
    # Bleib bei kleinen Werten (z. B. 40): Das schont die Augen und den Strom.
    if N_PIXEL == 0:
        return
    if anzahl is None:
        anzahl = N_PIXEL
    for i in range(N_PIXEL):
        if i < anzahl:
            streifen[i] = (r, g, b)
        else:
            streifen[i] = (0, 0, 0)
    streifen.show()


def senden(text):
    uart.write(text + "\n")


def zeile_lesen():
    # Gibt eine vollständige Zeile vom Browser zurück, sonst None
    global puffer
    if uart.any():
        daten = uart.read()
        if daten:
            try:
                puffer += str(daten, "UTF-8")
            except ValueError:
                puffer = ""   # kaputte Zeichen: wegwerfen
    if len(puffer) > 40:
        puffer = ""           # so lange ist keine gültige Zeile
    i = puffer.find("\n")
    if i < 0:
        return None
    zeile = puffer[:i].strip()
    puffer = puffer[i + 1:]
    return zeile


def geste_lesen(zeile):
    # "G0".."G2" -> 0..2, "G-" -> -1 (nicht sicher), alles andere -> None
    if zeile == "G-":
        return -1
    if len(zeile) == 2 and zeile[0] == "G" and zeile[1] in "012":
        return int(zeile[1])
    return None


def handzeichen_holen():
    # Alte Nachrichten wegwerfen, dann den Browser fragen und auf die Antwort warten
    global puffer
    while uart.any():
        uart.read()
    puffer = ""
    senden("?")
    start = running_time()
    while running_time() - start < ANTWORT_MS:
        zeile = zeile_lesen()
        if zeile is not None:
            g = geste_lesen(zeile)
            if g is not None:
                return g
        sleep(10)
    return None               # keine Antwort


def runde_spielen():
    global punkte_ich, punkte_computer

    # ---- Teil 1: Countdown ----
    # TODO 1: Zähle 3, 2, 1. Bei jeder Zahl n:
    #   - dem Browser die Zeile "C3", "C2" oder "C1" schicken:  senden("C" + str(n))
    #   - die Zahl auf dem Display zeigen:                      display.show(str(n))
    #   - einen kurzen Ton spielen (V2):                        music.pitch(440, 150, wait=False)
    #   - eine Sekunde warten:                                  sleep(1000)
    # Tipp: eine for-Schleife: for n in (3, 2, 1):
    #   ★ Neopixel: ampel(40, 40, 0, n) lässt n Stück gelb leuchten (N_PIXEL oben einstellen)


    display.show("0")
    g = handzeichen_holen()     # fertig: fragt den Browser nach deinem Handzeichen

    # ---- Teil 2: Wenn nichts erkannt wurde ----
    # TODO 2: g ist None (keine Antwort) oder -1 (nicht sicher erkannt)? Dann:
    #   - dem Browser die Zeile "X" schicken (Runde abgebrochen),
    #   - das Display kurz ein Image.CONFUSED zeigen lassen (sleep(1500)),
    #   - die Runde beenden (return).
    if g is None or g == -1:
        return

    # ---- Teil 3: Der micro:bit wählt ----
    # TODO 3: computer = zufällig 0, 1 oder 2.  Tipp: random.randint(0, 2)
    computer = 0

    # ---- Teil 4: Ergebnis berechnen und dem Browser melden ----
    # TODO 4: e mit ergebnis(g, computer) berechnen. Dann dem Browser das Resultat schicken,
    #         z. B. "R 1 0 1" (du: Papier, micro:bit: Stein, du gewinnst):  senden("R %d %d %d" % (g, computer, e))
    e = 0

    # ---- Teil 5: Anzeige, Töne, Punkte ----
    # TODO 5: Zeige nacheinander dein Handzeichen BILDER[g] und das des micro:bit BILDER[computer] (je 1 Sekunde).
    #   Dann je nach e:
    #     e == 1:   punkte_ich um 1 erhöhen, Image.YES zeigen, Melodie music.play(music.BA_DING, wait=False)
    #     e == -1:  punkte_computer um 1 erhöhen, Image.NO zeigen, Melodie music.play(music.WAWAWAWAA, wait=False)
    #     sonst:    "=" zeigen
    #   Danach dem Browser die Punkte schicken:  senden("P %d %d" % (punkte_ich, punkte_computer))
    #   und den Stand auf dem Display durchlaufen lassen:  display.scroll(str(punkte_ich) + ":" + str(punkte_computer))
    #   ★ Neopixel: ampel(0, 40, 0) grün, ampel(40, 0, 0) rot, ampel(40, 20, 0) orange


# --- Hauptschleife ---
display.show(Image.HAPPY)
ampel(0, 0, 0)
while True:
    if button_a.was_pressed():
        # TODO 6: Die Runde soll auch durch Schütteln starten:  or accelerometer.was_gesture("shake")
        #         Nach der Runde das Schütteln "vergessen": accelerometer.was_gesture("shake")
        runde_spielen()
        button_a.was_pressed()              # Tastendrücke während der Runde vergessen
        button_b.was_pressed()
        display.show(Image.HAPPY)
    if button_b.was_pressed():
        punkte_ich = 0
        punkte_computer = 0
        senden("P 0 0")
        ampel(0, 0, 0)
        display.show(Image.HAPPY)
    sleep(50)
