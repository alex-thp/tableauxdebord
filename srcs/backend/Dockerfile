# Étape 1 : Utiliser une image de base
FROM node:20-alpine

# Étape 2 : Définir le bon fuseau horaire
ENV TZ=Europe/Paris
RUN apk add --no-cache tzdata

# Étape 3 : Définir le répertoire de travail
WORKDIR /usr/src/app

# Étape 4 : Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

RUN ls -la /usr/src/app

# Étape 5 : Installer les dépendances
RUN npm install || cat npm-debug.log || true

# Étape 6 : Installer NestJS CLI globalement (facultatif si pas utilisé dans l’image)
RUN npm install -g @nestjs/cli

# Étape 7 : Copier le reste du projet
COPY . .

# Étape 8 : Donner les droits d’exécution au script d’entrée
RUN chmod +x /usr/src/app/entrypoint.sh

# Étape 9 : Définir le point d’entrée
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
