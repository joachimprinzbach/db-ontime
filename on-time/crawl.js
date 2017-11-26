const getDelays = require('./db-facade');
const dbSearchPageURL = 'https://www.bahn.de/p/view/index.shtml';
const puppeteer = require('puppeteer');
const moment = require('moment-timezone');
moment.locale('de');
moment.tz.setDefault("Europe/Berlin");

const crawlForDelays = async (START_STATION, TARGET_STATION, shouldRunOnWeekend, func = crawlInternal) => {
    const now = moment();
    const exactDepartureTime = moment({hour: 7, minute: 49}).format('HH:mm');
    const startCrawlTime = moment({hour: 6, minute: 50});
    const finishCrawlTime = moment({hour: 9, minute: 1});
    const isWorkingDay = !(now.weekday() == 5 || now.weekday() == 6);
    const isInTimeFrame = now.isBetween(startCrawlTime, finishCrawlTime);
    console.log("Time: " + now.format('HH:mm'));
    console.log("StartTime: " + startCrawlTime.format('HH:mm'));
    console.log("FinishTime: " + finishCrawlTime.format('HH:mm'));
    console.log('shouldRunOnWeekend: ', shouldRunOnWeekend, ' isWorkingDay: ', isWorkingDay, ' isInTimeFrame: ', isInTimeFrame);
    await func(isWorkingDay, shouldRunOnWeekend, exactDepartureTime, isInTimeFrame, START_STATION, TARGET_STATION);
};

const crawlInternal = async (isWorkingDay, shouldRunOnWeekend, exactDepartureTime, isInTimeFrame, START_STATION, TARGET_STATION) => {
    if ((isWorkingDay || shouldRunOnWeekend) && isInTimeFrame) {
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
    await page.goto(urlToOpen, {waitUntil: 'networkidle'});
    return {browser, page};
};

module.exports = {
    crawlForDelays,
    crawlInternal
};