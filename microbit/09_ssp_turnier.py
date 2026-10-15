# Zusatz ★★: Schere-Stein-Papier zu dritt per Funk (Turnier)
# Drei micro:bits in derselben GRUPPE, jeder mit einer eigenen SPIELER-Nummer (1, 2 oder 3).
#   Taste A: Wahl wechseln (Stein -> Papier -> Schere)
#   Taste B: Wahl abschicken, dann warten, bis die beiden anderen auch abgeschickt haben
# Jeder spielt gegen beide anderen. Für jeden besiegten Gegner gibt es einen Punkt.
#
# Funk-Nachricht (Text):  "<spieler>,<runde>,<wahl>"   z. B. "2,5,1" = Spieler 2 wählt in Runde 5 Papier
# Die Rundennummer schützt vor alten Nachrichten: Nachrichten einer älteren Runde werden ignoriert.
# Ist jemand weiter vorne, übernehmen wir seine Rundennummer.
from microbit import *
import radio

GRUPPE = 7                    # Alle drei dieselbe Zahl. Jede Gruppe eine eigene (0 bis 255)
SPIELER = 1                   # Jeder micro:bit eine andere Zahl: 1, 2 oder 3

radio.config(group=GRUPPE)
radio.on()

STEIN = Image("00000:09990:09990:09990:00000")
PAPIER = Image("99999:90009:90009:90009:99999")
SCHERE = Image("99009:99090:00900:99090:99009")
BILDER = [STEIN, PAPIER, SCHERE]

WARTEN_MS = 15000             # so lange wartet der micro:bit auf die anderen

wahl = 0                      # 0 = Stein, 1 = Papier, 2 = Schere
punkte = 0
runde = 1
display.show(BILDER[wahl])


def ergebnis(ich, gegner):
    d = (ich - gegner) % 3
    if d == 0:
        return 0
    if d == 1:
        return 1
    return -1


def nachricht_lesen(text):
    # "2,5,1" -> (2, 5, 1); alles andere -> None
    if text is None:
        return None
    teile = text.split(",")
    if len(teile) != 3:
        return None
    try:
        s = int(teile[0])
        r = int(teile[1])
        w = int(teile[2])
    except ValueError:
        return None
    if s < 1 or s > 3 or s == SPIELER or w < 0 or w > 2:
        return None
    return (s, r, w)


def funk_lesen():
    try:
        return radio.receive()
    except ValueError:
        return ""                 # kaputte Nachricht


def runde_spielen():
    global runde, punkte
    gegner = {}                   # Spieler-Nummer -> seine Wahl in dieser Runde
    while funk_lesen() is not None:   # alte Nachrichten wegwerfen: die anderen wiederholen ihre aktuelle ja alle 0,3 s
        pass
    display.show(Image.ALL_CLOCKS, wait=False, loop=True)   # warten ...
    start = running_time()
    letzter = start - 1000
    while len(gegner) < 2 and running_time() - start < WARTEN_MS:
        if running_time() - letzter > 300:
            radio.send(str(SPIELER) + "," + str(runde) + "," + str(wahl))   # Funk kann Nachrichten verlieren: wiederholen
            letzter = running_time()
        text = funk_lesen()
        while text is not None:
            n = nachricht_lesen(text)
            if n is not None:
                s, r, w = n
                if r > runde:
                    runde = r             # jemand ist weiter: Nummer übernehmen
                    gegner = {}           # bisher Gesammeltes gehört zu einer alten Runde
                if r == runde:
                    gegner[s] = w
            text = funk_lesen()
        sleep(20)

    if len(gegner) < 2:
        display.show(Image.SAD)       # nicht alle haben geantwortet
        sleep(1500)
    else:
        for i in range(3):            # die anderen warten vielleicht noch auf uns
            radio.send(str(SPIELER) + "," + str(runde) + "," + str(wahl))
            sleep(100)
        siege = 0
        niederlagen = 0
        for s in sorted(gegner):
            display.show(BILDER[gegner[s]])     # die Wahl des Gegners zeigen
            sleep(1000)
            e = ergebnis(wahl, gegner[s])
            if e == 1:
                siege += 1
            elif e == -1:
                niederlagen += 1
        punkte += siege
        if siege > niederlagen:
            display.show(Image.YES)
        elif siege < niederlagen:
            display.show(Image.NO)
        else:
            display.show("=")
        sleep(1000)
        display.scroll(str(punkte))

    runde += 1
    sleep(300)
    while funk_lesen() is not None:   # übrig gebliebene Nachrichten dieser Runde wegwerfen
        pass


# --- Hauptschleife ---
while True:
    if button_a.was_pressed():
        wahl = (wahl + 1) % 3
        display.show(BILDER[wahl])

    if button_b.was_pressed():
        runde_spielen()
        button_a.was_pressed()
        button_b.was_pressed()
        display.show(BILDER[wahl])

    sleep(50)
