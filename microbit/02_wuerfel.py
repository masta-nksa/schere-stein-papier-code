# Schritt 2: Sensor + Zufall
# Schütteln würfelt eine Zahl von 1 bis 6.
from microbit import *
import random

display.show("?")

while True:
    if accelerometer.was_gesture("shake"):
        zahl = random.randint(1, 6)
        display.show(zahl)
    sleep(50)
