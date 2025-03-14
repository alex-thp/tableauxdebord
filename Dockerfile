FROM node:18 AS build1

# Répertoire de travail pour la build
WORKDIR /app

# Copier les fichiers de dépendances pour installer les modules
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Installer Angular CLI globalement
RUN npm install -g @angular/cli

# Copier le reste du code de l'application
COPY . .

# Construire l'application Angular en mode production
RUN npm run build --prod

# Lancer l'application avec un serveur de production comme nginx (optionnel)
# CMD ["ng", "serve"]  # Ne pas utiliser dans une image de production
# Étape de construction de l'application Angular
FROM node:18 AS build

WORKDIR /app

# Copier les fichiers de dépendances pour installer les modules
COPY package.json package-lock.json ./

RUN npm install

# Copier le reste du code
COPY . .

# Construire l'application en mode production
RUN npm run build --prod

# Étape de déploiement avec Nginx
FROM nginx:alpine

# Copier les fichiers de build Angular dans le répertoire de Nginx
COPY --from=build1 /app/dist/ /usr/share/nginx/html
# Copier la configuration personnalisée de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 pour Nginx
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
