# Zusatz ★: Schere-Stein-Papier zu zweit per Funk
# Beide laden dieses Programm. Beide stellen dieselbe GRUPPE ein (jedes Paar eine andere Zahl!).
#   Taste A: Wahl wechseln
#   Taste B: Wahl abschicken, dann warten, bis der andere auch abgeschickt hat
from microbit import *
import radio

GRUPPE = 7                    # Paar 1 = 1, Paar 2 = 2, ... (0 bis 255)

radio.config(group=GRUPPE)
radio.on()

STEIN = Image("00000:09990:09990:09990:00000")
PAPIER = Image("99999:90009:90009:90009:99999")
SCHERE = Image("99009:99090:00900:99090:99009")
BILDER = [STEIN, PAPIER, SCHERE]

wahl = 0
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
        radio.send(str(wahl))
        display.show(Image.ALL_CLOCKS, wait=False, loop=True)   # warten ...

        gegner = None
        while gegner is None:
            nachricht = radio.receive()
            if nachricht in ("0", "1", "2"):
                gegner = int(nachricht)
            sleep(20)

        # Der andere wartet vielleicht noch auf uns: nochmals senden
        radio.send(str(wahl))

        display.show(BILDER[gegner])
        sleep(1000)
        e = ergebnis(wahl, gegner)
        if e == 1:
            display.show(Image.YES)
        elif e == -1:
            display.show(Image.NO)
        else:
            display.show("=")
        sleep(1500)

        # Übrig gebliebene Nachrichten dieser Runde wegwerfen
        sleep(300)
        while radio.receive() is not None:
            pass

        display.show(BILDER[wahl])

    sleep(50)
