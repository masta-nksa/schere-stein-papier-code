# micro:bit V2 als USB-Controller für "Fang das Licht"
# In MakeCode (makecode.microbit.org) -> Projekt -> "Python" umschalten -> alles ersetzen -> auf den micro:bit laden.
# Keine Verdrahtung nötig: Taste A = links, Taste B = rechts.
#
# Protokoll (identisch zur ESP8266-Firmware, Zeilen mit \n, 115200 Baud):
#   micro:bit -> Browser: "L", "R" oder "S" (Zustand)
#   Browser -> micro:bit: "G" = Game Over (trauriges Gesicht), "N" = Anzeige löschen

# Optional: Steuerung per Neigen statt per Tasten.
# Auf True setzen -> Neigen nach links/rechts steuert den Spieler.
NEIGEN = False


def on_data_received():
    cmd = serial.read_until(serial.delimiters(Delimiters.NEW_LINE))
    if cmd == "G":
        basic.show_icon(IconNames.SAD)
    elif cmd == "N":
        basic.clear_screen()


serial.on_data_received(serial.delimiters(Delimiters.NEW_LINE), on_data_received)


def on_forever():
    state = "S"
    if NEIGEN:
        x = input.acceleration(Dimension.X)
        if x < -300:
            state = "L"
        elif x > 300:
            state = "R"
    else:
        a = input.button_is_pressed(Button.A)
        b = input.button_is_pressed(Button.B)
        if a and not b:
            state = "L"
        elif b and not a:
            state = "R"
    serial.write_line(state)
    basic.pause(50)


basic.forever(on_forever)
