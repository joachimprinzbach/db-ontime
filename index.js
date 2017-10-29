const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
moment.locale('de');
const getDelays = require('./on-time/db-facade');

const config = require('./config.json');
const dbSearchPageURL = 'https://www.bahn.de/p/view/index.shtml';
const bot = new TelegramBot(config.token, {polling: false});

const app = require("express")();
const port = process.env.PORT || 4201;

const chatId = config.chatId;

app.listen(port, () => {
    const startCrawlTime = moment({hour: 7, minute: 0});
    const finishCrawlTime = moment({hour: 7, minute: 59});
    const delay = 1000 * 60 * 5;
    const START_STATION = 'Müllheim (Baden)';
    const TARGET_STATION = 'Basel SBB';
    const shouldRunOnWeekend = false;
    const exactDepartureTime = moment({hour: 7, minute: 49}).format('HH:mm');
    try {
        const greetingText = 'Hallo! Ich bin der DB Verspätungen Bot. In diesem Chat informiere ich über Verspätungen auf der Strecke von ' + START_STATION + ' nach ' + TARGET_STATION + '. Die Überprüfung erfolgt werktags zwischen ' + startCrawlTime.format('HH:mm') + ' und ' + finishCrawlTime.format('HH:mm');
        bot.sendMessage(chatId, greetingText, {parse_mode: 'Markdown'});

        const version = require('./package.json').version;
        const githubUrl = 'https://github.com/joachimprinzbach/db-ontime';
        const versionText = "Bot is running version " + version + ". Report any issues on [Github]("+ githubUrl +")!";
        bot.sendMessage(chatId, versionText, {parse_mode: 'Markdown'});
        crawlForDelays(startCrawlTime, finishCrawlTime, START_STATION, TARGET_STATION, shouldRunOnWeekend, exactDepartureTime);
        setInterval(crawlForDelays, delay);
    }
    catch (e) {
        console.error(e);
    }
});

const crawlForDelays = async (startCrawlTime, finishCrawlTime, START_STATION, TARGET_STATION, shouldRunOnWeekend, exactDepartureTIme) => {
    const now = moment();
    const isWorkingDay = !now.weekday() == (6 || 7);
    const isInTimeFrame = now.isBetween(startCrawlTime, finishCrawlTime);
    if ((isWorkingDay || shouldRunOnWeekend) && isInTimeFrame) {
        const {browser, page} = await openBrowserWindow(dbSearchPageURL);
        const messages = await getDelays(page, START_STATION, TARGET_STATION, exactDepartureTIme);
        messages.forEach(msg => {
            bot.sendMessage(chatId, msg, {parse_mode: 'Markdown'});
        });
        if (messages.length == 0 && config.alternateChatId) {
            bot.sendMessage(config.alternateChatId, "No delays found", {parse_mode: 'Markdown'});
        }
        browser.close();
    }
}

const openBrowserWindow = async urlToOpen => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    page.setViewport({width: 1200, height: 900});
    await page.goto(urlToOpen, {waitUntil: 'networkidle'});
    return {browser, page};
};

module.exports = app;