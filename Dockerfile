ARG BOT_TOKEN
ARG DB_URL
ARG TEST_GUILD_ID

FROM node

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# EXPOSE 443/tcp

CMD [ "node", "dist/index.js" ]