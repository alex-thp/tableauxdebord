FROM node:18

WORKDIR /app

# Copier les fichiers de dépendances et installer les modules
COPY package.json package-lock.json ./
RUN npm install -g @angular/cli
RUN npm install

# Copier tout le code de l'application
COPY . .

# Exposer le port Angular (par défaut 4200)
EXPOSE 4200

# Activer le polling pour détecter les changements de fichiers dans Docker
ENV CHOKIDAR_USEPOLLING=true

# Lancer le serveur Angular avec watch activé
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
