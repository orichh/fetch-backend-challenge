FROM node:slim

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm ci

COPY . .

# USER node
# RUN chown node:node -R /usr/src/app
EXPOSE 5000

CMD [ "npm", "start" ]