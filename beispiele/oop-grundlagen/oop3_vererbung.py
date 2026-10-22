# OOP 3: Vererbung und Polymorphie
# Starten: python oop3_vererbung.py
import random

import pygame

BREITE = 800
HOEHE = 450


class Figur:
    """Oberklasse: Was alle Figuren gemeinsam haben. Sie bewegen sich gleich, aber jede sieht anders aus."""

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = random.choice([-1, 1]) * random.uniform(2, 5)
        self.vy = random.choice([-1, 1]) * random.uniform(2, 5)
        self.farbe = (random.randint(80, 255), random.randint(80, 255), random.randint(80, 255))
        self.groesse = 20  # halbe Breite der Figur

    def bewegen(self):
        self.x += self.vx
        self.y += self.vy
        if self.x < self.groesse:
            self.x = self.groesse
            self.vx = -self.vx
        if self.x > BREITE - self.groesse:
            self.x = BREITE - self.groesse
            self.vx = -self.vx
        if self.y < self.groesse:
            self.y = self.groesse
            self.vy = -self.vy
        if self.y > HOEHE - self.groesse:
            self.y = HOEHE - self.groesse
            self.vy = -self.vy

    def zeichnen(self, flaeche):
        raise NotImplementedError("Jede Unterklasse legt fest, wie sie aussieht.")


class Ball(Figur):
    """Erbt alles von Figur und legt nur fest, wie er aussieht."""

    def zeichnen(self, flaeche):
        pygame.draw.circle(flaeche, self.farbe, (round(self.x), round(self.y)), self.groesse)


class Quadrat(Figur):
    """Erbt alles von Figur und legt nur fest, wie es aussieht."""

    def zeichnen(self, flaeche):
        rechteck = pygame.Rect(0, 0, 2 * self.groesse, 2 * self.groesse)
        rechteck.center = (round(self.x), round(self.y))
        pygame.draw.rect(flaeche, self.farbe, rechteck)


class Springball(Ball):
    """Erbt von Ball: sieht aus wie ein Ball, fällt aber nach unten (Schwerkraft)."""

    def __init__(self, x, y):
        super().__init__(x, y)  # zuerst alles wie bei Ball und Figur einrichten ...
        self.groesse = 12  # ... dann ändern und ergänzen, was anders ist
        self.schwerkraft = 0.3

    def bewegen(self):  # überschreibt bewegen() von Figur
        self.vy += self.schwerkraft  # Neu: jedes Bild etwas schneller nach unten
        super().bewegen()  # der Rest wie bei Figur: weiterbewegen und abprallen


pygame.init()
flaeche = pygame.display.set_mode((BREITE, HOEHE))
pygame.display.set_caption("OOP 3: Vererbung")
uhr = pygame.time.Clock()
schrift = pygame.font.Font(None, 28)

# Eine Liste mit Objekten aus verschiedenen Klassen
figuren = [Ball(200, 200), Quadrat(400, 200), Springball(600, 100)]

arten = {pygame.K_1: Ball, pygame.K_2: Quadrat, pygame.K_3: Springball}
art = Ball  # eine Klasse in einer Variablen: Damit wird beim Klick gebaut

laeuft = True
while laeuft:
    uhr.tick(60)

    for ereignis in pygame.event.get():
        if ereignis.type == pygame.QUIT:
            laeuft = False
        elif ereignis.type == pygame.KEYDOWN and ereignis.key in arten:
            art = arten[ereignis.key]
        elif ereignis.type == pygame.KEYDOWN and ereignis.key == pygame.K_r:
            figuren.clear()
        elif ereignis.type == pygame.MOUSEBUTTONDOWN:
            x, y = ereignis.pos
            figuren.append(art(x, y))

    # Polymorphie: Die Schleife fragt nicht, welche Art Figur es ist. Jede Figur weiss selbst,
    # wie sie sich bewegt und wie sie aussieht.
    for figur in figuren:
        figur.bewegen()

    flaeche.fill((18, 22, 40))
    for figur in figuren:
        figur.zeichnen(flaeche)
    zeile1 = schrift.render("1: Ball   2: Quadrat   3: Springball   Klick: neue Figur   R: alle weg", True, (235, 235, 245))
    zeile2 = schrift.render(f"Auswahl: {art.__name__}   Figuren: {len(figuren)}", True, (255, 210, 60))
    flaeche.blit(zeile1, (15, 15))
    flaeche.blit(zeile2, (15, 42))
    pygame.display.flip()

pygame.quit()
