// ESP8266 als USB-Controller für "Fang das Licht"
// Board in der Arduino-IDE: "NodeMCU 1.0 (ESP-12E Module)" oder "LOLIN(WEMOS) D1 R2 & mini"
// Baudrate: 115200
//
// Verdrahtung (Taster gegen GND, interner Pullup):
//   Taster LINKS  -> D1 (GPIO5)  und GND
//   Taster RECHTS -> D2 (GPIO4)  und GND
//   LED (mit 220 Ohm Vorwiderstand) -> D5 (GPIO14) und GND
//
// Protokoll:
//   ESP -> Browser: "L", "R" oder "S" (Zustand, bei Änderung und alle 100 ms)
//   Browser -> ESP: "G" = LED an (Game Over), "N" = LED aus

const int PIN_LEFT  = D1;
const int PIN_RIGHT = D2;
const int PIN_LED   = D5;

char lastState = 'S';
unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LEFT, INPUT_PULLUP);
  pinMode(PIN_RIGHT, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
}

void loop() {
  bool left  = digitalRead(PIN_LEFT)  == LOW;
  bool right = digitalRead(PIN_RIGHT) == LOW;

  char state = 'S';
  if (left && !right) state = 'L';
  if (right && !left) state = 'R';

  if (state != lastState || millis() - lastSend > 100) {
    Serial.println(state);
    lastState = state;
    lastSend = millis();
  }

  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == 'G') digitalWrite(PIN_LED, HIGH);
    if (c == 'N') digitalWrite(PIN_LED, LOW);
  }
}
