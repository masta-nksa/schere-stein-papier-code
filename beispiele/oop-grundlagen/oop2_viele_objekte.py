# OOP 2: Viele Objekte in einer Liste
# Starten: python oop2_viele_objekte.py
import random

import pygame

BREITE = 800
HOEHE = 450


class Ball:
    """Fast wie in OOP 1. Neu: Tempo und Farbe wählt der Ball selbst zufällig."""

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = random.choice([-1, 1]) * random.uniform(2, 5)
        self.vy = random.choice([-1, 1]) * random.uniform(2, 5)
        self.farbe = (random.randint(80, 255), random.randint(80, 255), random.randint(80, 255))
        self.radius = 20

    def bewegen(self):
        self.x += self.vx
        self.y += self.vy
        if self.x < self.radius:
            self.x = self.radius
            self.vx = -self.vx
        if self.x > BREITE - self.radius:
            self.x = BREITE - self.radius
            self.vx = -self.vx
        if self.y < self.radius:
            self.y = self.radius
            self.vy = -self.vy
        if self.y > HOEHE - self.radius:
            self.y = HOEHE - self.radius
            self.vy = -self.vy

    def zeichnen(self, flaeche):
        pygame.draw.circle(flaeche, self.farbe, (round(self.x), round(self.y)), self.radius)


pygame.init()
flaeche = pygame.display.set_mode((BREITE, HOEHE))
pygame.display.set_caption("OOP 2: viele Objekte")
uhr = pygame.time.Clock()
schrift = pygame.font.Font(None, 28)

baelle = []  # hier kommen alle Ball-Objekte hinein
for i in range(3):
    baelle.append(Ball(BREITE / 2, HOEHE / 2))

laeuft = True
while laeuft:
    uhr.tick(60)

    for ereignis in pygame.event.get():
        if ereignis.type == pygame.QUIT:
            laeuft = False
        elif ereignis.type == pygame.MOUSEBUTTONDOWN:
            x, y = ereignis.pos
            baelle.append(Ball(x, y))  # ein neues Objekt bauen und in die Liste legen
        elif ereignis.type == pygame.KEYDOWN and ereignis.key == pygame.K_r:
            baelle.clear()  # alle Bälle weg

    # Eine Schleife für alle Bälle, egal ob es 3 oder 300 sind
    for ball in baelle:
        ball.bewegen()

    flaeche.fill((18, 22, 40))
    for ball in baelle:
        ball.zeichnen(flaeche)
    text = schrift.render(f"Bälle: {len(baelle)}   Klick: neuer Ball   R: alle weg", True, (235, 235, 245))
    flaeche.blit(text, (15, 15))
    pygame.display.flip()

pygame.quit()
