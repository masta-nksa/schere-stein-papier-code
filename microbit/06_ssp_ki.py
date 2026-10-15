# LÖSUNG zu Lektion 2, Schritt 3 (erst nach einem eigenen Versuch mit 06_ssp_ki_vorlage.py ansehen!)
# Schere-Stein-Papier gegen den micro:bit, dein Handzeichen kommt vom Browser
#   Taste A oder Schütteln: Runde starten (Countdown 3-2-1 mit Ton auf dem Display)
#   Taste B: Punkte auf 0 zurücksetzen
# Der micro:bit redet über das USB-Kabel mit der Browser-Seite ki/02-microbit/.
#
# Protokoll (Textzeilen mit \n, 115200 Baud):
#   micro:bit -> Browser:  "C3" "C2" "C1" Countdown | "?" Handzeichen anfordern
#                          "R <du> <micro:bit> <ergebnis>"  Resultat (1 = du gewinnst, 0 = unentschieden, -1 = du verlierst)
#                          "P <du> <micro:bit>"  Punkte | "X"  Runde abgebrochen
#   Browser -> micro:bit:  "G0" Stein, "G1" Papier, "G2" Schere, "G-" nicht sicher erkannt
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
    for n in (3, 2, 1):
        senden("C" + str(n))
        display.show(str(n))
        ampel(40, 40, 0, n)                 # Neopixel: 3, 2, 1 Stück gelb
        music.pitch(440, 150, wait=False)   # kurzer Ton (V2)
        sleep(1000)
    display.show("0")
    g = handzeichen_holen()

    if g is None or g == -1:
        senden("X")
        ampel(0, 0, 40)                     # blau: Runde zählt nicht
        if g is None:
            display.scroll("Browser?")
        else:
            display.show(Image.CONFUSED)    # nicht sicher erkannt: Runde noch einmal starten
            sleep(1500)
        return

    computer = random.randint(0, 2)
    e = ergebnis(g, computer)
    senden("R %d %d %d" % (g, computer, e))

    display.show(BILDER[g])                 # was der Browser erkannt hat
    sleep(1000)
    display.show(BILDER[computer])          # was der micro:bit gewählt hat
    sleep(1000)
    if e == 1:
        punkte_ich += 1
        ampel(0, 40, 0)                     # grün: du gewinnst
        music.play(music.BA_DING, wait=False)
        display.show(Image.YES)
    elif e == -1:
        punkte_computer += 1
        ampel(40, 0, 0)                     # rot: du verlierst
        music.play(music.WAWAWAWAA, wait=False)
        display.show(Image.NO)
    else:
        ampel(40, 20, 0)                    # orange: unentschieden
        display.show("=")
    sleep(1000)

    senden("P %d %d" % (punkte_ich, punkte_computer))
    display.scroll(str(punkte_ich) + ":" + str(punkte_computer))


# --- Hauptschleife ---
display.show(Image.HAPPY)
ampel(0, 0, 0)
while True:
    if button_a.was_pressed() or accelerometer.was_gesture("shake"):
        runde_spielen()
        button_a.was_pressed()              # Tastendrücke und Schütteln während der Runde vergessen
        button_b.was_pressed()
        accelerometer.was_gesture("shake")
        display.show(Image.HAPPY)
    if button_b.was_pressed():
        punkte_ich = 0
        punkte_computer = 0
        senden("P 0 0")
        ampel(0, 0, 0)
        display.show(Image.HAPPY)
    sleep(50)
