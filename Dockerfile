FROM node:latest

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY . /usr/src/bot

RUN npm install --quiet
RUN npm run compile
CMD ["node", "index.js"]

