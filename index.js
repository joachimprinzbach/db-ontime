const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
moment.locale('de');

const dbSearchPageURL = 'https://www.bahn.de/p/view/index.shtml';
const apiToken = '416417756:AAGax9aSZBoiM2PnHstUkPulJbJJYX-Tkvc';

const bot = new TelegramBot(apiToken, {polling: false});
const groupChatId = -214638451;
const joachimChatId = 11701970;
const delay = 1000 * 60 * 5;

const START_STATION = 'Müllheim (Baden)';
const TARGET_STATION = 'Basel SBB';
const toSelector = '#js-auskunft-autocomplete-to';
const fromSelector = '#js-auskunft-autocomplete-from';

const app = require("express")();
const port = process.env.PORT || 4201;

const startCrawlTime = moment({ hour:11, minute:0 });
const finishCrawlTime = moment({ hour:12, minute:50 });;

const crawlForDelays = async function () {
    const now = moment();
    const isWorkingDay = !now.weekday() == (6 || 7);
    const isInTimeFrame = now.hours.isBetween(startCrawlTime, finishCrawlTime);
    if (!isWorkingDay && isInTimeFrame) {
        const {browser, page} = await openBrowserWindow(dbSearchPageURL);
        await insertText(page, fromSelector, START_STATION);
        await insertText(page, toSelector, TARGET_STATION);

        const submit = await page.$('.js-submit-btn');
        await submit.click();

        await page.waitForSelector('span.ontime');
        await page.waitFor(2 * 1000);

        const resultSelector = '#resultsOverview';
        const content = await page.content();
        const $ = cheerio.load(content);
        const connections = $(resultSelector).children('.boxShadow.scheduledCon');
        connections.each((i, con) => {
            const trs = $(con).children('tr');
            const firstRow = $(trs).eq(0).children('td');
            const secondRow = $(trs).eq(1).children('td');
            const startTime = $(firstRow).eq(1);
            const startStationName = $(firstRow).eq(0).text();
            const destinationStationName = $(secondRow).eq(0).text();
            const scheduledDepartureTime = $(startTime)
                .clone()
                .children()
                .remove()
                .end()
                .text();
            const delay = $(startTime).children('span.ontime').first().text();
            const delayTime = parseInt(delay.replace(/\+/g, ''), 10);
            if (delayTime > 0) {
                const text = "*VERSPÄTUNG!*\n" + scheduledDepartureTime + " Uhr\nvon: " + startStationName.trim() + "\nnach: " + destinationStationName.trim() + "\n*" + delayTime + " Minuten*";
                bot.sendMessage(joachimChatId, text, {parse_mode: 'Markdown'});
                console.log(text);
            }
        });
        browser.close();
    }
}

app.listen(port, () => {
    try {
        crawlForDelays();
        setInterval(crawlForDelays, delay);
    }
    catch (e) {
        console.error(e);
    }
});

async function openBrowserWindow(urlToOpen) {
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
}

async function insertText(page, selector, value) {
    const input = await page.$(selector);
    await input.click();
    await page.type(selector, value);
}

module.exports = app;