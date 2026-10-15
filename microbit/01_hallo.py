# Schritt 1: Eingabe -> Ausgabe
# Taste A zeigt ein lachendes Gesicht, Taste B ein trauriges.
from microbit import *

display.scroll("Hallo")

while True:
    if button_a.was_pressed():
        display.show(Image.HAPPY)
    if button_b.was_pressed():
        display.show(Image.SAD)
    sleep(50)
