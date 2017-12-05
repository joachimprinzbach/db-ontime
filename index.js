const app = require("express")();
const port = process.env.PORT || 4201;
const config = require('./config.json');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN || config.token;
const bot = new TelegramBot(token, {polling: false});
const crawl = require('./on-time/crawl');

app.listen(port, () => {
    const delay = 1000 * 60 * config.delay;
    try {
        const crawlFunc = crawl.crawlForDelays.bind(this, bot, config.connections);
        crawlFunc();
        setInterval(crawlFunc, delay);
    } catch (error) {
        console.error("Error occurred: ", error);
    }
});

module.exports = app;