FROM node:20-alpine

ENV TZ=Europe/Paris

RUN apk add --no-cache bash

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g @nestjs/cli ts-node-dev
RUN npm install

# Ne copie PAS tout ici (le code viendra du volume monté)
EXPOSE 3000

CMD ["ts-node-dev", "--respawn", "--poll", "--transpile-only", "src/main.ts"]
