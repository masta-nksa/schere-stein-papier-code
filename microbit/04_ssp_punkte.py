# Schritt 4: Punkte zählen und Ton (Best of 3)
# Wer zuerst 3 Runden gewinnt, gewinnt das Spiel.
from microbit import *
import random
import music

STEIN = Image("00000:09990:09990:09990:00000")
PAPIER = Image("99999:90009:90009:90009:99999")
SCHERE = Image("99009:99090:00900:99090:99009")
BILDER = [STEIN, PAPIER, SCHERE]

ZIEL = 3                      # so viele Siege braucht es

wahl = 0
punkte_ich = 0
punkte_computer = 0
display.show(BILDER[wahl])


def ergebnis(ich, gegner):
    d = (ich - gegner) % 3
    if d == 0:
        return 0
    if d == 1:
        return 1
    return -1


while True:
    if button_a.was_pressed():
        wahl = (wahl + 1) % 3
        display.show(BILDER[wahl])

    if button_b.was_pressed():
        computer = random.randint(0, 2)
        display.show(BILDER[computer])
        sleep(1000)
        e = ergebnis(wahl, computer)
        if e == 1:
            punkte_ich += 1
            music.play(music.BA_DING, wait=False)
            display.show(Image.YES)
        elif e == -1:
            punkte_computer += 1
            music.play(music.WAWAWAWAA, wait=False)
            display.show(Image.NO)
        else:
            display.show("=")
        sleep(1000)

        # Spielstand anzeigen, z. B. "2:1"
        display.scroll(str(punkte_ich) + ":" + str(punkte_computer))

        if punkte_ich == ZIEL or punkte_computer == ZIEL:
            if punkte_ich == ZIEL:
                music.play(music.POWER_UP, wait=False)
                display.scroll("Sieg!")
            else:
                display.scroll("Verloren")
            punkte_ich = 0
            punkte_computer = 0

        display.show(BILDER[wahl])

    sleep(50)
