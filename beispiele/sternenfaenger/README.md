# Tutorial: Ein Spiel mit Python entwickeln

In sechs Schritten baust du «Sternenfänger»: von einem leeren Fenster bis zu einem Spiel, das online im Browser läuft.
Sterne fangen, Steinen ausweichen. Unterwegs lernst du, wie Spiele aufgebaut sind: die Spielschleife, Delta-Time, Klassen,
Vererbung und Szenen. Genau so ist auch die [Spielvorlage](https://github.com/masta-nksa/spiel-vorlage) aufgebaut,
mit der du in der Richtung **Spieleprogrammierung** startest.

Du kannst das Tutorial vor dem Projekt durcharbeiten oder einfach zum Nachlesen benutzen. Zu den Schritten 1 bis 4 gibt es je
ein lauffähiges Programm. Lies den Text, starte das Programm, lies den Code und probiere die Aufgaben aus.

| Schritt | Thema | Programm |
|---|---|---|
| [1](#schritt-1-die-spielschleife) | Die Spielschleife und Delta-Time | `schritt1_fenster.py` |
| [2](#schritt-2-die-erste-klasse) | Die erste Klasse: der Spieler | `schritt2_spieler.py` |
| [3](#schritt-3-viele-objekte-gruppen-zeitgeber-kollision) | Viele Objekte: Gruppen, Zeitgeber, Kollision | `schritt3_sterne.py` |
| [4](#schritt-4-vererbung-und-polymorphie) | Vererbung und Polymorphie | `schritt4_vererbung.py` |
| [5](#schritt-5-szenen-und-eigene-dateien) | Szenen und eigene Dateien | die Spielvorlage |
| [6](#schritt-6-online-stellen) | Online stellen | die Spielvorlage |

## Vorbereitung

Du brauchst Python (ab 3.10) und VS Code. Installiere einmal im Terminal von VS Code **pygame-ce**:

```bash
python -m pip install pygame-ce
```

Die Programme liegen in deinem Arbeitsordner unter `beispiele/sternenfaenger/schritte/`
(oder auf [GitHub](https://github.com/masta-nksa/schere-stein-papier-code/tree/main/beispiele/sternenfaenger/schritte)).
Öffne im Terminal diesen Ordner und starte ein Programm:

```bash
cd beispiele/sternenfaenger/schritte
```

```bash
python schritt1_fenster.py
```

> **pygame oder pygame-ce?** Beide lädt man mit `import pygame`, sie vertragen sich aber nicht im selben Python.
> Beim Start muss im Terminal `pygame-ce` stehen. Steht dort nur `pygame 2.6…`, zuerst
> `python -m pip uninstall -y pygame pygame-ce` und dann nochmals `python -m pip install pygame-ce`.

---

## Schritt 1: Die Spielschleife

**Programm:** `schritt1_fenster.py`. Ein gelber Kreis fliegt von links nach rechts.

Ein Spiel ist eine Schleife, die etwa 60-mal pro Sekunde dasselbe tut:

```
Eingaben lesen  →  aktualisieren  →  zeichnen  →  (von vorne)
```

```python
while laeuft:
    dt = min(uhr.tick(60) / 1000, 0.05)

    for ereignis in pygame.event.get():      # 1. Eingaben
        if ereignis.type == pygame.QUIT:
            laeuft = False

    x += tempo * dt                          # 2. Aktualisieren

    flaeche.fill((18, 22, 40))               # 3. Zeichnen
    pygame.draw.circle(flaeche, (255, 210, 60), (round(x), HOEHE // 2), 20)
    pygame.display.flip()

    await asyncio.sleep(0)
```

**Delta-Time (`dt`)** ist die Zeit in Sekunden seit dem letzten Bild. Das Tempo gibst du in **Pixel pro Sekunde** an,
und in jedem Bild bewegst du um `tempo * dt`:

| Rechner | Bilder pro Sekunde | dt | Weg pro Bild bei 200 Pixel/s | Weg pro Sekunde |
|---|---|---|---|---|
| schnell | 60 | 0.017 s | 3.3 Pixel | 200 Pixel |
| langsam | 30 | 0.033 s | 6.7 Pixel | 200 Pixel |

Auf jedem Gerät ist der Kreis also gleich schnell. Würdest du einfach `x += 3` rechnen, liefe das Spiel auf einem langsamen
Laptop in Zeitlupe. Mit `min(..., 0.05)` gibt es nach einer Pause (zum Beispiel einem Tab-Wechsel im Browser) keinen riesigen
Sprung. `await asyncio.sleep(0)` braucht es später für den Browser: Dort gibt die Zeile die Kontrolle kurz an die Webseite zurück.

**Probier aus**

1. Ändere `tempo`. Wie schnell ist 50, wie schnell 1000?
2. Lösche die Zeile `flaeche.fill(...)`. Was passiert, und warum?
3. Ändere `uhr.tick(60)` auf `uhr.tick(30)`. Der Kreis bleibt gleich schnell. Warum?
4. ★ Und mit `uhr.tick(10)`? Jetzt wird er langsamer. Welche Zeile ist daran schuld, und ist das gut oder schlecht?

**Funktioniert es?**

- [ ] Ein Fenster geht auf, und der Kreis fliegt immer wieder von links nach rechts.
- [ ] Du kannst erklären, warum der Kreis mit `tick(30)` gleich schnell bleibt.

---

## Schritt 2: Die erste Klasse

**Programm:** `schritt2_spieler.py`. Du bewegst eine blaue Schale mit den Pfeiltasten, mit A/D oder der Maus.

Eine **Klasse** ist ein Bauplan, ein **Objekt** ist ein Ding, das nach diesem Bauplan gebaut wurde.
Die Klasse `Spieler` legt fest, welche **Daten** ein Spieler hat (Bild, Position) und was er **kann** (`update`):

```python
class Spieler(pygame.sprite.Sprite):
    GESCHWINDIGKEIT = 420  # Pixel pro Sekunde

    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((80, 18), pygame.SRCALPHA)
        self.rect = self.image.get_rect(midbottom=(BREITE / 2, HOEHE - 20))
        self.x = float(self.rect.centerx)

    def update(self, dt):
        ...  # Tasten lesen, self.x ändern, am Rand stoppen
        self.rect.centerx = round(self.x)
```

In der Schleife steht danach nur noch `spieler.update(dt)` und `flaeche.blit(spieler.image, spieler.rect)`.
Die Schleife muss nicht wissen, *wie* sich der Spieler bewegt. Das weiss der Spieler selbst.

- `pygame.sprite.Sprite` ist eine fertige Klasse von pygame. Ein Sprite hat ein Bild (`image`) und ein Rechteck (`rect`),
  das sagt, wo das Bild liegt.
- `self.x` ist eine Kommazahl, `rect` kennt nur ganze Pixel. Ohne `self.x` gingen kleine Schritte verloren.

**Probier aus**

1. Mach den Spieler schneller oder langsamer (`GESCHWINDIGKEIT`).
2. Mach die Schale breiter (die Zahl 80). Stoppt sie trotzdem genau am Rand? Warum?
3. ★ Der Spieler soll sich mit W/S auch nach oben und unten bewegen.

**Funktioniert es?**

- [ ] Die Schale bewegt sich mit Pfeiltasten, A/D und der Maus und bleibt im Fenster.

---

## Schritt 3: Viele Objekte: Gruppen, Zeitgeber, Kollision

**Programm:** `schritt3_sterne.py`. Sterne fallen herunter, und jeder gefangene Stern gibt einen Punkt.

Neu sind drei Werkzeuge, die du in fast jedem Spiel brauchst:

**Gruppen.** Statt einer Liste von Sternen gibt es eine `pygame.sprite.Group`. Ein einziger Befehl bewegt oder zeichnet alle:

```python
sterne = pygame.sprite.Group()
sterne.update(dt)     # ruft update(dt) bei jedem Stern auf
sterne.draw(flaeche)  # zeichnet jeden Stern
```

Ein Stern, der unten aus dem Bild fällt, entfernt sich mit `self.kill()` selbst aus der Gruppe.

**Zeitgeber.** Etwas soll alle 0.8 Sekunden passieren. Dafür zählst du mit `dt` herunter:

```python
bis_zum_naechsten -= dt
if bis_zum_naechsten <= 0:
    sterne.add(Stern(random.randint(20, BREITE - 20), 180))
    bis_zum_naechsten = 0.8
```

**Kollision.** `spritecollide` liefert alle Sterne, deren Rechteck den Spieler berührt. Mit `dokill=True` verschwinden sie gleich:

```python
gefangen = pygame.sprite.spritecollide(spieler, sterne, dokill=True)
punkte += len(gefangen)
```

**Probier aus**

1. Lass mehr Sterne fallen (Zeitgeber kleiner als 0.8).
2. Jeder Stern bekommt ein zufälliges Tempo zwischen 120 und 300.
3. ★ Lösche `self.kill()` und gib `len(sterne)` im Fenster aus. Was passiert nach einer Minute?

**Funktioniert es?**

- [ ] Sterne fallen, und beim Fangen zählen die Punkte hoch.
- [ ] Du kannst erklären, warum ein Zeitgeber mit `dt` besser ist als «alle 50 Bilder».

---

## Schritt 4: Vererbung und Polymorphie

**Programm:** `schritt4_vererbung.py`. Jetzt fallen auch graue Steine. Wer einen fängt, hat verloren.

Stern und Stein **fallen gleich**, sehen aber anders aus und **wirken anders**. Statt den Code zu kopieren, schreibst du eine
gemeinsame **Oberklasse**. Die **Unterklassen** erben das Fallen und legen nur fest, was anders ist:

```
              FallendesObjekt
              update(dt): fallen, unten verschwinden
              bild_erstellen()  → muss die Unterklasse festlegen
              beim_fangen()     → muss die Unterklasse festlegen
                 /                     \
             Stern                     Stein
     gelber Stern, +1 Punkt      graues Quadrat, verloren
```

```python
class Stern(FallendesObjekt):
    def bild_erstellen(self):
        ...  # gelben Stern zeichnen
    def beim_fangen(self, szene):
        szene.punkte += 1

class Stein(FallendesObjekt):
    def bild_erstellen(self):
        ...  # graues Quadrat zeichnen
    def beim_fangen(self, szene):
        szene.verloren()
```

Beim Fangen fragt das Spiel nicht, *was* gefangen wurde. Es ruft bei jedem Objekt dieselbe Methode auf, und jedes Objekt reagiert
auf seine Art. Das heisst **Polymorphie**:

```python
for objekt in pygame.sprite.spritecollide(self.spieler, self.fallende, dokill=True):
    objekt.beim_fangen(self)
```

Willst du später ein Herz, das ein Leben schenkt, schreibst du eine neue Unterklasse. Am Code zum Fangen änderst du nichts.

Ausserdem ist die Runde jetzt eine Klasse `SpielSzene`. Sie hält alles zusammen, was zum Spiel gehört (Spieler, Gruppe, Punkte,
Zeit), und hat drei Methoden: `ereignis`, `aktualisieren` und `zeichnen`. Eine neue Runde ist einfach ein neues Objekt:
`szene = SpielSzene()`.

**Probier aus**

1. Ändere den Anteil der Steine (`random.random() < 0.3`).
2. Schreibe eine Unterklasse `Goldstern`, die 5 Punkte gibt. Ergänze sie dort, wo `art = ...` ausgewählt wird.
3. ★ Statt sofort Game Over: drei Leben. Wo speicherst du sie, und wo ziehst du eines ab?

**Funktioniert es?**

- [ ] Ein Stein beendet das Spiel, die Leertaste startet eine neue Runde.
- [ ] Du kannst erklären, warum `Stern` keine eigene Methode `update` braucht.

---

## Schritt 5: Szenen und eigene Dateien

**Code:** die [Spielvorlage](https://github.com/masta-nksa/spiel-vorlage), Ordner `spiel/`.

In Schritt 4 muss die Hauptschleife wissen, dass es ein Game Over gibt und dass die Leertaste neu startet. Kommen ein Menü,
eine Pause und Levels dazu, wird die Schleife schnell unübersichtlich. Die Lösung sind **Szenen**: Jeder Zustand des Spiels ist
eine eigene Klasse, und **genau eine** Szene ist aktiv. Das nennt man einen **Zustandsautomaten**:

```
  Menü ──Leertaste──▶ Spiel ──Stein──▶ Game Over
   ▲                    │                  │
   └──────Escape────────┘                  │
                        ▲───Leertaste──────┘
```

Alle Szenen erben von der Oberklasse `Szene` mit den drei Methoden aus Schritt 4. Die Klasse `Spiel` hält die aktuelle Szene und
gibt jedes Bild an sie weiter. Wann gewechselt wird, entscheidet die Szene selbst:

```python
class MenueSzene(Szene):
    def ereignis(self, ereignis):
        if ist_weiter(ereignis):
            self.spiel.wechsle_zu(SpielSzene(self.spiel))
```

Weil das Programm grösser wird, ist es auf mehrere Dateien verteilt:

| Datei | Inhalt |
|---|---|
| `spiel/main.py` | Klasse `Spiel` mit der Spielschleife, Startpunkt |
| `spiel/szenen.py` | `Szene`, `MenueSzene`, `SpielSzene`, `GameOverSzene` |
| `spiel/figuren.py` | `Spieler`, `FallendesObjekt`, `Stern`, `Stein` (wie in Schritt 4) |
| `spiel/einstellungen.py` | Grösse, Farben, Tempo an einem Ort |

Lies die Dateien in dieser Reihenfolge: `einstellungen.py`, `figuren.py`, `szenen.py`, `main.py`. Fast alles kennst du schon.

**Probier aus**

1. Ändere in `einstellungen.py` Titel und Farben.
2. ★ Baue eine `PauseSzene`: Die Taste P hält das Spiel an und setzt es fort.
   Tipp: Die Pause-Szene merkt sich die laufende `SpielSzene` und wechselt am Ende zu ihr zurück.

**Funktioniert es?**

- [ ] Du findest in `szenen.py` die Stelle, an der vom Spiel zu Game Over gewechselt wird.

---

## Schritt 6: Online stellen

Das Werkzeug [pygbag](https://github.com/pygame-web/pygbag) übersetzt dein Spiel so, dass es im Browser läuft, auch auf dem Handy.

- **Im Team-Repo:** Bei jedem Push baut GitHub das Spiel und stellt es online. Wie das geht, steht in der
  [Anleitung zum Team-Repo](../../anleitungen/spiel-team-repo.md).
- **Allein, zum Selbststudium:** In der [Spielvorlage](https://github.com/masta-nksa/spiel-vorlage) auf
  **Use this template → Create a new repository** klicken und das Repo in deinem eigenen GitHub-Konto anlegen (**Public**).
  Dann unter **Settings → Pages → Source** die Option **GitHub Actions** wählen und unter **Actions** den Lauf
  *Spiel online stellen* starten. Dein Spiel läuft danach unter `https://<dein-name>.github.io/<repo>/`.
- **Vorher lokal im Browser testen**, im Ordner der Vorlage (dann <http://localhost:8000> öffnen):

  ```bash
  python -m pip install pygbag
  ```

  ```bash
  python -m pygbag spiel
  ```

Damit es im Browser läuft: Startdatei `main.py`, in der Schleife `await asyncio.sleep(0)`, kein `input()` und kein
`time.sleep()`, Töne nur als `.ogg`.

---

## Wie geht es weiter? Vom Beispiel zum eigenen Spiel

1. **Klein anfangen.** Eine einzige Spielidee, die Spass macht (springen, ausweichen, sammeln). Mehr kommt später.
2. **Zuerst mit Rechtecken.** Erst wenn sich das Spiel gut anfühlt, kommen Bilder und Töne dazu.
3. **«Juice» hinzufügen.** Kleine Rückmeldungen machen viel aus: Der Bildschirm wackelt kurz, Funken sprühen, ein Ton spielt.
4. **Andere spielen lassen.** Schau zu, ohne zu helfen. Wo bleiben sie hängen?
5. **In kleinen Schritten committen.** Nach jeder Verbesserung, die läuft.

Ideen: Jump'n'Run mit Levels · Space Shooter mit Gegnerwellen · Top-down-Abenteuer mit Karte · Puzzlespiel · Tower Defense

**Zum Weiterlesen und Weiterbauen**

- [pygame-ce-Dokumentation](https://pyga.me/docs/): alle Befehle, mit Beispielen
- [Game Programming Patterns](https://gameprogrammingpatterns.com/) von Robert Nystrom, frei online: Spielschleife, Zustand und mehr
- [Kenney](https://kenney.nl/assets): kostenlose Grafiken und Töne für Spiele (gemeinfrei, CC0)
- [Tiled](https://www.mapeditor.org/): Editor für Karten und Levels aus Kacheln

[Zurück zu Etappe 3](../../etappen/03-projektstart.md) · [Zurück zur Übersicht](../../README.md)
