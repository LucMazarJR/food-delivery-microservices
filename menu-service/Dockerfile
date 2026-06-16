FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --no-package-lock

COPY . .

CMD ["sh", "-c", "npm install --no-package-lock && npm run start:dev"]
