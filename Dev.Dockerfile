FROM node:18

WORKDIR /usr/src/app

COPY package* ./

RUN npm i