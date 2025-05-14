# Étape 1 : Build Angular
FROM node:18 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Étape 2 : Serveur NGINX
FROM nginx:alpine

# Supprimer la config par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers Angular buildés
COPY --from=builder /app/dist/* /usr/share/nginx/html/

# Exposer le port HTTP standard
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
