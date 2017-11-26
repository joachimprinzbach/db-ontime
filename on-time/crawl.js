const getDelays = require('./db-facade');
const dbSearchPageURL = 'https://www.bahn.de/p/view/index.shtml';
const puppeteer = require('puppeteer');
const moment = require('moment-timezone');
const config = require('../config.json');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN || config.token;
const bot = new TelegramBot(token, {polling: false});
moment.locale('de');
moment.tz.setDefault("Europe/Berlin");

const crawlForDelays = async () => {
    for (let connection of config.connections) {
        const now = moment();
        const exactDepartureTime = moment(connection.exactConnection).format('HH:mm');
        const startCrawlTime = moment(connection.crawlStart);
        const finishCrawlTime = moment(connection.crawlEnd);
        const isWorkingDay = !(now.weekday() == 5 || now.weekday() == 6);
        const isInTimeFrame = now.isBetween(startCrawlTime, finishCrawlTime);
        if ((isWorkingDay || connection.runOnWeekend) && isInTimeFrame) {
            console.log('Crawling...');
            const {browser, page} = await openBrowserWindow(dbSearchPageURL);
            const messages = await getDelays(page, connection.start, connection.destination, exactDepartureTime, connection.minDelay);
            messages.forEach(msg => {
                console.log('Sending Telegram msg: ', msg);
                const chatId = "TELEGRAM_CHAT_ID_" + connection.connectionId;
                console.log(chatId);
                bot.sendMessage(process.env[chatId] || connection.chatId, msg, {parse_mode: 'Markdown'});
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
};

const openBrowserWindow = async urlToOpen => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    page.setViewport({width: 1200, height: 900});
    await page.goto(urlToOpen, {waitUntil: 'networkidle2'});
    return {browser, page};
};

module.exports = crawlForDelays;
