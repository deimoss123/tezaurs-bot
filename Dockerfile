FROM oven/bun
# RUN apk --no-cache add --virtual .builds-deps build-base python3 

WORKDIR /usr/app

COPY package.json ./
COPY bun.lockb ./

RUN bun install

COPY . .