# Etappe 2, Schritt 4 (Finale): Duell per Funk
# Zwei Personen stehen Rücken an Rücken, jede vor ihrer eigenen Laptop-Kamera.
# Beide laden dieses Programm und stellen dieselbe GRUPPE ein (jedes Paar eine andere Zahl!).
#   Taste A: Runde starten. Auf BEIDEN micro:bits läuft der Countdown 3-2-1.
#   Taste B: Punkte auf 0 zurücksetzen
# Bei 0 holt jeder micro:bit das Handzeichen vom eigenen Browser (Seite ki/02-microbit/),
# schickt es per Funk an den anderen, vergleicht und zeigt das Ergebnis.
#
# Seriell (USB, 115200 Baud, Zeilen mit \n), gleich wie in 06_ssp_ki.py:
#   micro:bit -> Browser:  "C3" "C2" "C1" | "?" | "R <ich> <gegnerin> <ergebnis>" | "P <ich> <gegnerin>" | "X"
#   Browser -> micro:bit:  "G0" Stein, "G1" Papier, "G2" Schere, "G-" nicht sicher erkannt
# Funk (Text):
#   "S,<runde>,<n>"  Start: Runde Nummer <runde>, Countdown steht bei <n> (3, 2 oder 1)
#   "G,<runde>,<g>"  Handzeichen <g> ("0", "1", "2" oder "-") in Runde <runde>
# Die Rundennummer schützt vor alten Funknachrichten: Nachrichten einer anderen Runde zählen nicht.
from microbit import *
import radio
import random

GRUPPE = 7                    # Paar 1 = 1, Paar 2 = 2, ... (0 bis 255)

radio.config(group=GRUPPE)
radio.on()
uart.init(baudrate=115200)    # USB-Verbindung zum Computer

STEIN = Image("00000:09990:09990:09990:00000")
PAPIER = Image("99999:90009:90009:90009:99999")
SCHERE = Image("99009:99090:00900:99090:99009")
BILDER = [STEIN, PAPIER, SCHERE]

ANTWORT_MS = 3000             # so lange wartet der micro:bit auf den eigenen Browser
FUNK_MS = 6000                # so lange wartet er auf das Handzeichen der anderen Person

punkte_ich = 0
punkte_gegner = 0
puffer = ""                   # angefangene Zeile vom Browser
runde = 0                     # Nummer der laufenden Runde
letzte_runde = 0              # Nummer der zuletzt gespielten Runde
gegner_geste = None           # Handzeichen der anderen Person in dieser Runde


def ergebnis(ich, gegner):
    # 1 = gewonnen, 0 = unentschieden, -1 = verloren
    d = (ich - gegner) % 3
    if d == 0:
        return 0
    if d == 1:
        return 1
    return -1


# ---------- USB-Seite (Browser) ----------

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
                puffer = ""
    if len(puffer) > 40:
        puffer = ""
    i = puffer.find("\n")
    if i < 0:
        return None
    zeile = puffer[:i].strip()
    puffer = puffer[i + 1:]
    return zeile


def geste_lesen(zeile):
    # "G0".."G2" -> "0".."2", "G-" -> "-", alles andere -> None
    if zeile == "G-":
        return "-"
    if len(zeile) == 2 and zeile[0] == "G" and zeile[1] in "012":
        return zeile[1]
    return None


def handzeichen_holen():
    # Alte Nachrichten wegwerfen, den Browser fragen, auf die Antwort warten
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
    return None


# ---------- Funk-Seite ----------

def funk_lesen():
    # Eine Funknachricht als Text, None wenn nichts wartet, "" wenn sie kaputt war
    try:
        return radio.receive()
    except ValueError:
        return ""


def nachricht_lesen(text):
    # "S,12,3" -> ("S", 12, 3); "G,12,1" -> ("G", 12, "1"); alles andere -> None
    if text is None:
        return None
    teile = text.split(",")
    if len(teile) != 3:
        return None
    typ = teile[0]
    try:
        r = int(teile[1])
    except ValueError:
        return None
    wert = teile[2]
    if typ == "S" and wert in ("1", "2", "3"):
        return ("S", r, int(wert))
    if typ == "G" and wert in ("0", "1", "2", "-"):
        return ("G", r, wert)
    return None


def funk_senden(typ, wert):
    radio.send(typ + "," + str(runde) + "," + str(wert))


def funk_pruefen():
    # Liest alle wartenden Funknachrichten und behandelt nur die passenden
    global runde, gegner_geste
    text = funk_lesen()
    while text is not None:
        n = nachricht_lesen(text)
        if n is not None:
            typ, r, wert = n
            if typ == "S" and r != runde and r != letzte_runde:
                # Beide haben fast gleichzeitig gestartet: die grössere Nummer gewinnt
                if r > runde:
                    runde = r
            elif typ == "G" and r == runde:
                gegner_geste = wert
            # alles andere (alte Runde, Wiederholungen) wird ignoriert
        text = funk_lesen()


def neue_rundennummer():
    r = random.randint(1, 99)
    while r == letzte_runde:
        r = random.randint(1, 99)
    return r


def funk_leeren():
    while radio.receive_bytes() is not None:
        pass


# ---------- Eine Runde ----------

def runde_spielen(start_n):
    global letzte_runde, gegner_geste, punkte_ich, punkte_gegner
    gegner_geste = None

    # Countdown: bei jeder Zahl den Start nochmals funken (falls einer verpasst wurde)
    for n in range(start_n, 0, -1):
        senden("C" + str(n))
        display.show(str(n))
        funk_senden("S", n)
        ende = running_time() + 1000
        while running_time() < ende:
            funk_pruefen()
            sleep(20)
    display.show("0")

    mein = handzeichen_holen()
    if mein is None:
        display.scroll("Browser?")
        mein = "-"                      # die andere Person erfährt: diese Runde zählt nicht

    # Meine Wahl funken und auf die der anderen Person warten
    funk_senden("G", mein)
    start = running_time()
    letzter_versuch = start
    while gegner_geste is None and running_time() - start < FUNK_MS:
        funk_pruefen()
        if running_time() - letzter_versuch > 300:
            funk_senden("G", mein)      # Funk kann Nachrichten verlieren: nochmals senden
            letzter_versuch = running_time()
        sleep(20)

    if gegner_geste is not None:
        for i in range(3):              # die andere Person wartet vielleicht noch auf mich
            funk_senden("G", mein)
            sleep(100)

    letzte_runde = runde

    if gegner_geste is None:
        senden("X")
        display.show(Image.SAD)         # keine Antwort per Funk
        sleep(1500)
    elif mein == "-" or gegner_geste == "-":
        senden("X")
        display.show(Image.CONFUSED)    # eine Hand nicht sicher erkannt: Runde wiederholen
        sleep(1500)
    else:
        ich = int(mein)
        gegner = int(gegner_geste)
        e = ergebnis(ich, gegner)
        senden("R %d %d %d" % (ich, gegner, e))
        display.show(BILDER[ich])
        sleep(1000)
        display.show(BILDER[gegner])
        sleep(1000)
        if e == 1:
            punkte_ich += 1
            display.show(Image.YES)
        elif e == -1:
            punkte_gegner += 1
            display.show(Image.NO)
        else:
            display.show("=")
        sleep(1000)
        senden("P %d %d" % (punkte_ich, punkte_gegner))
        display.scroll(str(punkte_ich) + ":" + str(punkte_gegner))

    # Übrig gebliebene Funknachrichten dieser Runde wegwerfen
    sleep(300)
    funk_leeren()


# --- Hauptschleife ---
display.show(Image.HAPPY)
while True:
    start_n = 0
    if button_a.was_pressed():
        runde = neue_rundennummer()
        start_n = 3
    else:
        n = nachricht_lesen(funk_lesen())
        if n is not None and n[0] == "S" and n[1] != letzte_runde:
            runde = n[1]                # die andere Person hat gestartet
            start_n = n[2]
    if start_n > 0:
        runde_spielen(start_n)
        button_a.was_pressed()          # Tastendrücke während der Runde vergessen
        button_b.was_pressed()
        display.show(Image.HAPPY)
    if button_b.was_pressed():
        punkte_ich = 0
        punkte_gegner = 0
        senden("P 0 0")
        display.show(Image.HAPPY)
    sleep(20)
