FROM node:20-alpine

ENV TZ=Europe/Paris

# Ajout des dépendances système
RUN apk add --no-cache tzdata bash

# Crée le dossier de travail
WORKDIR /usr/src/app

# Copie uniquement les fichiers package.json pour optimiser le cache Docker
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste du code
COPY . .

CMD ["npm", "run", "start:dev"]

