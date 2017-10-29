# db-ontime
Telegram Bot that sends messages for train delays

## Hacking on db-ontime
You only need to have node.js (>= 8.4.0) installed.

### Installing node.js:

See http://nodejs.org/download/

### Configuring telegram
Edit the config.json file to configure the application.

- Token: See https://core.telegram.org/bots#6-botfather for information how to create a new App and obtain the token
- ChatId: See https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id for information how to obtain the chatId of a chat

### Installing dependencies
```sh
$ npm install
```

### Run the application locally
```sh
$ node index
```
