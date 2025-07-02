FROM node:20-slim

ENV TZ=Europe/Paris

# Puppeteer recommande ces dépendances pour Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    gnupg \
    tzdata \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Installer Puppeteer (avec Chromium)
COPY package*.json ./
RUN npm install -g @nestjs/cli ts-node-dev && npm install

# Ne copie PAS le code source ici (volume monté)
EXPOSE 3000

CMD ["ts-node-dev", "--respawn", "--poll", "--transpile-only", "src/main.ts"]

#FROM node:20-alpine

#ENV TZ=Europe/Paris

#RUN apk add --no-cache bash

#WORKDIR /usr/src/app

#COPY package*.json ./
#RUN npm install -g @nestjs/cli ts-node-dev
#RUN npm install

#EXPOSE 3000

#CMD ["ts-node-dev", "--respawn", "--poll", "--transpile-only", "src/main.ts"]
