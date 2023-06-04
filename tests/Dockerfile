FROM node:19-alpine

WORKDIR /usr/src/app
COPY package*.json .

RUN npm install
RUN mkdir reports

COPY . .

CMD npm test