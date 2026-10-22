# OOP 1: Eine Klasse, zwei Objekte
# Starten: python oop1_klasse.py
import pygame

BREITE = 800
HOEHE = 450


class Ball:
    """Der Bauplan für einen Ball. Jeder Ball hat eigene Daten (Attribute) und kann etwas (Methoden)."""

    def __init__(self, x, y, vx, vy, farbe):
        # __init__ läuft, wenn ein neuer Ball gebaut wird. self ist genau dieser neue Ball.
        self.x = x
        self.y = y
        self.vx = vx  # Tempo nach rechts, in Pixel pro Bild (negativ: nach links)
        self.vy = vy  # Tempo nach unten (negativ: nach oben)
        self.farbe = farbe
        self.radius = 20

    def bewegen(self):
        self.x += self.vx
        self.y += self.vy
        # am Rand abprallen: zurück an den Rand setzen und die Richtung umkehren
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
pygame.display.set_caption("OOP 1: eine Klasse, zwei Objekte")
uhr = pygame.time.Clock()

# Zwei Objekte nach demselben Bauplan, jedes mit eigenen Daten
ball1 = Ball(200, 150, 4, 3, (255, 210, 60))
ball2 = Ball(600, 300, -2, 5, (80, 160, 255))

laeuft = True
while laeuft:
    uhr.tick(60)  # höchstens 60 Bilder pro Sekunde

    for ereignis in pygame.event.get():
        if ereignis.type == pygame.QUIT:
            laeuft = False

    ball1.bewegen()
    ball2.bewegen()

    flaeche.fill((18, 22, 40))
    ball1.zeichnen(flaeche)
    ball2.zeichnen(flaeche)
    pygame.display.flip()

pygame.quit()
