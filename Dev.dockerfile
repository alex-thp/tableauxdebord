FROM node:18

WORKDIR /app

# Copier les fichiers de dépendances et installer les modules
COPY package.json ./
RUN npm install -g @angular/cli
RUN npm install

# Copier tout le code de l'application
COPY . .

# Exposer le port Angular (par défaut 4200)
EXPOSE 4200

# Lancer le serveur de développement Angular sur toutes les interfaces réseau
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--watch", "--disable-host-check"]
