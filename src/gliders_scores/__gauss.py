import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm

# Votre liste de valeurs
with open("src/gliders_scores/_jantarstd3.txt", "r") as f:
    content = f.read()


def floor(n, b):
    return n - (n % b)


data = [floor(float(c) * 100, 4) for c in content.split(",")[:-1] if float(c) > 0]

print(len(data))

# Calcul des paramètres de la gaussienne
mu, std = np.mean(data), np.std(data)

# Générer les points pour la gaussienne
x = np.linspace(min(data), max(data), 100)
p = norm.pdf(x, mu, std)

# Tracer les données et la gaussienne
plt.hist(data, bins=len(set(data)), density=True, alpha=0.6, color="g", label="Données")
plt.plot(x, p, "k", linewidth=2, label="Gaussienne")

title = f"Ajustement Gaussien: mu = {mu:.2f},  std = {std:.2f}"
plt.title(title)
plt.legend()

plt.show()
