# Schritt 3: Schere-Stein-Papier gegen den micro:bit
#   Taste A: deine Wahl wechseln (Stein -> Papier -> Schere)
#   Taste B: Wahl bestätigen, der micro:bit wählt zufällig
from microbit import *
import random

# Eigene 5x5-Bilder: 9 = hell, 0 = aus
STEIN = Image("00000:09990:09990:09990:00000")
PAPIER = Image("99999:90009:90009:90009:99999")
SCHERE = Image("99009:99090:00900:99090:99009")

BILDER = [STEIN, PAPIER, SCHERE]

wahl = 0                      # 0 = Stein, 1 = Papier, 2 = Schere
display.show(BILDER[wahl])


def ergebnis(ich, gegner):
    # 1 = gewonnen, 0 = unentschieden, -1 = verloren
    d = (ich - gegner) % 3
    if d == 0:
        return 0
    if d == 1:                # Papier schlägt Stein, Schere schlägt Papier, Stein schlägt Schere
        return 1
    return -1


while True:
    if button_a.was_pressed():
        wahl = (wahl + 1) % 3
        display.show(BILDER[wahl])

    if button_b.was_pressed():
        computer = random.randint(0, 2)
        display.show(BILDER[computer])     # Wahl des micro:bit zeigen
        sleep(1000)
        e = ergebnis(wahl, computer)
        if e == 1:
            display.show(Image.YES)
        elif e == -1:
            display.show(Image.NO)
        else:
            display.show("=")
        sleep(1000)
        display.show(BILDER[wahl])

    sleep(50)
