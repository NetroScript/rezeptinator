# build stage

FROM node:lts-alpine as  build

RUN mkdir -p /app
WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm install

COPY . /app/

RUN npm run build

# production container
FROM node:lts-alpine

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=80 \
    DOMAIN=http://localhost

RUN mkdir -p /app
WORKDIR /app

RUN npm install pm2 -g

COPY \
 --chown=node:node \
 --from=build \
 /app/dist/ /app/dist/

COPY --chown=node:node ./package-lock.json /app/
COPY --chown=node:node ./package.json /app/
COPY --chown=node:node ./ecosystem.config.js /app/

RUN npm install

USER node

EXPOSE ${PORT}

CMD ["pm2-runtime", "ecosystem.config.js"]