# Zusatz ★: Reaktionsspiel
#   Taste A: Spiel starten. Das Display wird dunkel.
#   Nach einer Zufallszeit (2 bis 5 Sekunden) leuchtet das ganze Display.
#   Dann so schnell wie möglich Taste B drücken. Der micro:bit zeigt deine Zeit in Millisekunden.
#   Zu früh gedrückt? Dann gibt es keine Zeit.
from microbit import *
import random
import music

ALLE_AN = Image("99999:99999:99999:99999:99999")

bestzeit = None               # schnellste Zeit bisher (None = noch keine)

display.show(Image.HAPPY)

while True:
    if button_a.was_pressed():
        display.clear()
        warten = random.randint(2000, 5000)        # Zufallszeit in Millisekunden
        start = running_time()                      # Zeit seit dem Start des micro:bit
        zu_frueh = False
        button_b.was_pressed()                      # alte Tastendrücke vergessen

        while running_time() - start < warten:
            if button_b.was_pressed():
                zu_frueh = True
                break
            sleep(10)

        if zu_frueh:
            display.show(Image.SAD)
            music.play(music.WAWAWAWAA, wait=False)
            sleep(1500)
        else:
            display.show(ALLE_AN)
            t0 = running_time()
            while not button_b.was_pressed():       # warten, bis B gedrückt wird
                sleep(1)
            zeit = running_time() - t0              # so viele Millisekunden hat es gedauert

            if bestzeit is None or zeit < bestzeit:
                bestzeit = zeit
                music.play(music.POWER_UP, wait=False)
                display.scroll(str(zeit) + " ms Rekord!")
            else:
                display.scroll(str(zeit) + " ms")

        button_a.was_pressed()                      # Tastendrücke während der Anzeige vergessen
        button_b.was_pressed()
        display.show(Image.HAPPY)

    sleep(50)
