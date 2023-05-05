FROM node:18

WORKDIR /usr/src/app

COPY . .

ENV DATABASE_URL="postgresql://scorm:Password123@localhost:5432/scorm?schema=public"
ENV PORT=3001

EXPOSE 3001

RUN npm i && npm run build

RUN npx prisma generate

CMD ["npm", "start"]