FROM node:20-alpine

ENV TZ=Europe/Paris

RUN apk add --no-cache tzdata bash
RUN npm install -g @nestjs/cli

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
