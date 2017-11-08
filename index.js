const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment-timezone');
moment.locale('de');
moment.tz.setDefault("Europe/Berlin");
const getDelays = require('./on-time/db-facade');

const config = require('./config.json');
const dbSearchPageURL = 'https://www.bahn.de/p/view/index.shtml';

const app = require("express")();
const port = process.env.PORT || 4201;

const chatId = process.env.TELEGRAM_CHAT_ID || config.chatId;
const token = process.env.TELEGRAM_TOKEN || config.token;
const bot = new TelegramBot(token, {polling: false});

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
        const crawlFunc = crawlForDelays.bind(this, START_STATION, TARGET_STATION, shouldRunOnWeekend);
        crawlFunc();
        setInterval(crawlFunc, delay);
    }
    catch (e) {
        console.error("Error occurred: ", e);
    }
});

const crawlForDelays = async (START_STATION, TARGET_STATION, shouldRunOnWeekend) => {
    const now = moment();
    const exactDepartureTime = moment({hour: 7, minute: 49}).format('HH:mm');
    const startCrawlTime = moment({hour: 6, minute: 50});
    const finishCrawlTime = moment({hour: 7, minute: 1});
    const isWorkingDay = !(now.weekday() == 5 || now.weekday() == 6);
    const isInTimeFrame = now.isBetween(startCrawlTime, finishCrawlTime);
    console.log("Time: " + now.format('HH:mm'));
    console.log("StartTime: " + startCrawlTime.format('HH:mm'));
    console.log("FinishTime: " + finishCrawlTime.format('HH:mm'));
    console.log('shouldRunOnWeekend: ', shouldRunOnWeekend, ' isWorkingDay: ', isWorkingDay, ' isInTimeFrame: ', isInTimeFrame);
    if ((isWorkingDay || shouldRunOnWeekend) && true) {
        console.log('Crawling...');
        const {browser, page} = await openBrowserWindow(dbSearchPageURL);
        const messages = await getDelays(page, START_STATION, TARGET_STATION, exactDepartureTime);
        messages.forEach(msg => {
            console.log('Sending Telegram msg: ', msg);
            bot.sendMessage(chatId, msg, {parse_mode: 'Markdown'});
        });
        if (messages.length == 0) {
            console.log('No delays found.');
        } else {
            console.log('Found delays. Message has been sent.');
        }
        browser.close();
    } else {
        console.log('Not checking. Outside of time window.');
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