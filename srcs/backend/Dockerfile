FROM node:20-alpine

ENV TZ=Europe/Paris

RUN apk add --update tzdata
COPY . .
RUN npm install npm

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g @nestjs/cli

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
RUN npm install

CMD [ "/entrypoint.sh" ]