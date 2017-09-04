FROM node:8

ADD ./ /usr/app
WORKDIR /usr/app

RUN npm install

COPY . .

EXPOSE 8080

CMD npm start