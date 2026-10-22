# OOP-Grundlagen: Klassen, Objekte, Vererbung

Ein ganz kleines Beispiel mit pygame-ce: Bälle und Quadrate hüpfen durchs Fenster. Mehr passiert nicht, denn hier geht es nur
um die Grundideen der **objektorientierten Programmierung (OOP)**. Sie stecken in jedem Spiel, auch im
[Tutorial «Sternenfänger»](../sternenfaenger/README.md) und in der Spielvorlage.

| Teil | Thema | Programm |
|---|---|---|
| [1](#teil-1-klasse-und-objekt) | Klasse und Objekt | `oop1_klasse.py` |
| [2](#teil-2-viele-objekte) | Viele Objekte in einer Liste | `oop2_viele_objekte.py` |
| [3](#teil-3-vererbung-und-polymorphie) | Vererbung und Polymorphie | `oop3_vererbung.py` |

## Vorbereitung

Du brauchst Python und **pygame-ce** (einmal im Terminal von VS Code installieren):

```bash
python -m pip install pygame-ce
```

Die Programme liegen in deinem Arbeitsordner unter `beispiele/oop-grundlagen/`
(oder auf [GitHub](https://github.com/masta-nksa/schere-stein-papier-code/tree/main/beispiele/oop-grundlagen)).
Im Terminal in den Ordner wechseln und ein Programm starten:

```bash
cd beispiele/oop-grundlagen
```

```bash
python oop1_klasse.py
```

> Damit der Code kurz bleibt, bewegen sich die Figuren hier um eine feste Anzahl Pixel **pro Bild**.
> Wie man das Tempo vom Rechner unabhängig macht (Delta-Time), zeigt Schritt 1 im [Sternenfänger](../sternenfaenger/README.md#schritt-1-die-spielschleife).

## Die wichtigsten Begriffe

| Begriff | Bedeutung | Im Beispiel |
|---|---|---|
| **Klasse** | ein Bauplan | `class Ball:` |
| **Objekt** | ein Ding, das nach dem Bauplan gebaut wurde | `ball1 = Ball(...)` |
| **Attribut** | eine Eigenschaft, die jedes Objekt selbst speichert | `self.x`, `self.farbe` |
| **Methode** | etwas, das ein Objekt kann (eine Funktion in der Klasse) | `bewegen()`, `zeichnen()` |
| **Konstruktor** | die Methode `__init__`, die beim Bauen läuft | setzt Startwerte |
| **Vererbung** | eine Klasse übernimmt alles von einer anderen | `class Ball(Figur):` |
| **Polymorphie** | derselbe Aufruf, verschiedene Wirkung | `figur.zeichnen(...)` |

---

## Teil 1: Klasse und Objekt

**Programm:** `oop1_klasse.py`. Zwei Bälle fliegen durchs Fenster und prallen am Rand ab.

**Ohne Klasse** bräuchte jeder Ball fünf eigene Variablen, und für jeden Ball müsstest du das Abprallen nochmals schreiben:

```python
ball1_x, ball1_y, ball1_vx, ball1_vy, ball1_farbe = 200, 150, 4, 3, (255, 210, 60)
ball2_x, ball2_y, ball2_vx, ball2_vy, ball2_farbe = 600, 300, -2, 5, (80, 160, 255)
```

**Mit Klasse** schreibst du einmal einen Bauplan. Er sagt, welche Daten ein Ball hat und was er kann:

```python
class Ball:
    def __init__(self, x, y, vx, vy, farbe):
        self.x = x
        self.y = y
        ...

    def bewegen(self):
        self.x += self.vx
        ...

    def zeichnen(self, flaeche):
        pygame.draw.circle(flaeche, self.farbe, (round(self.x), round(self.y)), self.radius)
```

Danach baust du beliebig viele **Objekte**. Jedes hat seine eigenen Werte:

```python
ball1 = Ball(200, 150, 4, 3, (255, 210, 60))   # gelb
ball2 = Ball(600, 300, -2, 5, (80, 160, 255))  # blau
ball1.bewegen()                                # bewegt nur ball1
```

- **`__init__`** läuft automatisch, wenn du `Ball(...)` schreibst. Dort bekommt der neue Ball seine Startwerte.
- **`self`** ist «dieser Ball hier». Bei `ball1.bewegen()` ist `self` der Ball `ball1`, bei `ball2.bewegen()` der Ball `ball2`.
  Darum ändert `self.x += self.vx` immer nur den eigenen Ball.

**Probier aus**

1. Baue einen dritten Ball `ball3` in einer anderen Farbe. Was musst du alles ergänzen?
2. Schreibe nach dem Bauen `print(ball1.farbe, ball2.farbe)`. Was steht im Terminal?
3. Gib dem Ball ein zusätzliches Attribut `radius` als Parameter, damit jeder Ball eine eigene Grösse haben kann.
4. ★ Schreibe eine neue Methode `schneller(self)`, die das Tempo verdoppelt. Rufe sie für `ball1` auf, wenn die Leertaste
   gedrückt wird (Tipp: `ereignis.type == pygame.KEYDOWN and ereignis.key == pygame.K_SPACE`).

**Funktioniert es?**

- [ ] Zwei Bälle fliegen durchs Fenster und prallen an allen vier Rändern ab.
- [ ] Du kannst erklären, was der Unterschied zwischen `Ball` und `ball1` ist.

---

## Teil 2: Viele Objekte

**Programm:** `oop2_viele_objekte.py`. Jeder Mausklick baut einen neuen Ball. Mit R sind alle weg.

Bei vielen Objekten schreibst du nicht `ball1`, `ball2`, `ball3` …, sondern legst alle in eine **Liste**:

```python
baelle = []
baelle.append(Ball(x, y))   # neues Objekt bauen und in die Liste legen

for ball in baelle:         # jedem Ball dasselbe sagen
    ball.bewegen()
```

Die Schleife funktioniert gleich für 3 oder 300 Bälle. Tempo und Farbe wählt jetzt der Ball in `__init__` selbst
zufällig aus. Darum braucht `Ball(x, y)` nur noch die Position.

**Probier aus**

1. Starte mit 10 statt 3 Bällen.
2. Mit der Leertaste soll der letzte Ball verschwinden (Tipp: `baelle.pop()`, aber nur, wenn die Liste nicht leer ist).
3. ★ Jeder Ball bekommt eine zufällige Grösse zwischen 8 und 40.

**Funktioniert es?**

- [ ] Jeder Klick baut einen Ball an der Mausposition, die Zahl oben links zählt mit.
- [ ] Du kannst erklären, warum du in der Hauptschleife nichts ändern musst, wenn es mehr Bälle werden.

---

## Teil 3: Vererbung und Polymorphie

**Programm:** `oop3_vererbung.py`. Mit den Tasten 1, 2, 3 wählst du, was ein Klick baut: Ball, Quadrat oder Springball.

Ball und Quadrat **bewegen sich gleich**, sehen aber **anders aus**. Statt das Bewegen in jede Klasse zu kopieren, gibt es
eine gemeinsame **Oberklasse** `Figur`. Die **Unterklassen** erben alles von ihr und legen nur fest, was anders ist:

```
                    Figur
                    __init__(): Position, Tempo, Farbe
                    bewegen():  fliegen und abprallen
                    zeichnen(): muss die Unterklasse festlegen
                   /            \
               Ball              Quadrat
               zeichnen(): Kreis  zeichnen(): Quadrat
                 |
             Springball
             bewegen(): mit Schwerkraft
```

```python
class Ball(Figur):          # Ball erbt von Figur
    def zeichnen(self, flaeche):
        pygame.draw.circle(...)
```

`Ball` hat keine eigene Methode `bewegen`, kann sich aber trotzdem bewegen: Er hat sie von `Figur` **geerbt**.

**Überschreiben und `super()`.** Der `Springball` erbt von `Ball` und sieht darum gleich aus. Beim Bewegen kommt aber
Schwerkraft dazu. Er **überschreibt** die Methode `bewegen` mit einer eigenen Version und ruft darin mit `super()` die
geerbte Version auf:

```python
class Springball(Ball):
    def __init__(self, x, y):
        super().__init__(x, y)    # zuerst alles wie bei Ball und Figur einrichten
        self.groesse = 12         # dann ändern und ergänzen, was anders ist
        self.schwerkraft = 0.3

    def bewegen(self):
        self.vy += self.schwerkraft   # Neu: schneller nach unten
        super().bewegen()             # der Rest wie bei Figur
```

**Polymorphie.** In der Liste `figuren` liegen Bälle, Quadrate und Springbälle durcheinander. Die Hauptschleife fragt nicht,
welche Art Figur es ist. Sie ruft bei allen dieselben Methoden auf, und jede Figur reagiert auf ihre Art:

```python
for figur in figuren:
    figur.bewegen()          # Springball: mit Schwerkraft, die anderen: ohne
    figur.zeichnen(flaeche)  # Ball: Kreis, Quadrat: Quadrat
```

Willst du eine neue Figur, schreibst du eine neue Unterklasse. An der Hauptschleife änderst du nichts.

**Probier aus**

1. Gib dem Springball mehr oder weniger Schwerkraft. Was passiert bei `-0.3`?
2. Schreibe eine Unterklasse `Riesenquadrat(Quadrat)`, die doppelt so gross ist. Sie braucht nur `__init__`
   mit `super().__init__(x, y)` und einer neuen `groesse`. Lege sie auf die Taste 4.
3. Schreibe eine Unterklasse `Ring(Figur)`, die nur einen Kreisrand zeichnet
   (Tipp: `pygame.draw.circle(flaeche, farbe, mitte, radius, 3)`, die 3 ist die Randdicke).
4. ★ Schreibe eine Unterklasse `Blinker(Ball)`, die bei jedem Abprallen eine neue zufällige Farbe bekommt.
   Tipp: In `bewegen` vor und nach `super().bewegen()` das Tempo vergleichen.

**Funktioniert es?**

- [ ] Mit 1, 2, 3 wählst du die Art, und ein Klick baut genau diese Figur.
- [ ] Du kannst erklären, warum `Ball` keine eigene Methode `bewegen` braucht.
- [ ] Du kannst erklären, was `super().bewegen()` im Springball macht.

---

## Und im echten Spiel?

Im [Sternenfänger](../sternenfaenger/README.md) und in der Spielvorlage findest du genau diese Ideen wieder:

- `class Spieler(pygame.sprite.Sprite)`: Der Spieler erbt von einer fertigen Klasse von pygame.
- `FallendesObjekt` ist die Oberklasse, `Stern` und `Stein` sind die Unterklassen
  ([Schritt 4](../sternenfaenger/README.md#schritt-4-vererbung-und-polymorphie)).
- Szenen wie Menü, Spiel und Game Over sind Unterklassen von `Szene`
  ([Schritt 5](../sternenfaenger/README.md#schritt-5-szenen-und-eigene-dateien)).

[Zum Tutorial «Sternenfänger»](../sternenfaenger/README.md) · [Zurück zu Etappe 3](../../etappen/03-projektstart.md) · [Zurück zur Übersicht](../../README.md)
