FROM node:18-alpine
RUN apk --no-cache add --virtual .builds-deps build-base python3 bash

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build