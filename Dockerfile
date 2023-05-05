FROM node:18

WORKDIR /usr/src/app

COPY . .

ENV PORT=3001

EXPOSE 3001

RUN npm i && npm run build

RUN npx prisma generate

CMD ["npm", "start"]