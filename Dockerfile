FROM node:20-alpine as development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

USER node

FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

RUN npm install --only=production && npm cache clean --force

USER node

FROM node:20-alpine as production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/environments ./environments
COPY --chown=node:node --from=build /usr/src/app/run.sh ./run.sh

RUN apk update && \
    apk add --no-cache \
    docker-cli \
    bash

RUN chmod +x ./run.sh

CMD [ "./run.sh" ]


