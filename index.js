const TelegramBot = require('node-telegram-bot-api');
const app = require("express")();
const port = process.env.PORT || 4201;

const config = require('./config.json');
const chatId = process.env.TELEGRAM_CHAT_ID || config.chatId;
const token = process.env.TELEGRAM_TOKEN || config.token;
const bot = new TelegramBot(token, {polling: false});
const crawl = require('./on-time/crawl');

app.listen(port, () => {
    const delay = 1000 * 60 * 4;
    const START_STATION = 'Müllheim (Baden)';
    const TARGET_STATION = 'Basel SBB';
    const shouldRunOnWeekend = true;
    const sendStartMessage = false;
    try {
        if (sendStartMessage) {
            const version = require('./package.json').version;
            const githubUrl = 'https://github.com/joachimprinzbach/db-ontime';
            const versionText = "Bot is running version " + version + ". Report any issues on [Github](" + githubUrl + ")!";
            bot.sendMessage(chatId, versionText, {parse_mode: 'Markdown'});
        }
        const crawlFunc = crawl.crawlForDelays.bind(this, START_STATION, TARGET_STATION, shouldRunOnWeekend);
        crawlFunc();
        setInterval(crawlFunc, delay);
    } catch (e) {
        console.error("Error occurred: ", e);
    }
});

module.exports = app;