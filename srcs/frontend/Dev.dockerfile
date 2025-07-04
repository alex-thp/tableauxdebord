FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install

COPY . .

EXPOSE 4200

ENV CHOKIDAR_USEPOLLING=true

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
# Note: This Dockerfile is for development purposes only.
