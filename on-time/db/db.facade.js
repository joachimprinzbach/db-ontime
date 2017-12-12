const searchForConnections = require('./search-page.facade');
const resultpage = require('./result-page.facade');
const dbSearchPageURL = 'https://www.bahn.de/p/view/index.shtml';
const moment = require('moment-timezone');
const puppeteer = require('puppeteer');
moment.locale('de');
moment.tz.setDefault("Europe/Berlin");

const getDelayMessagesFor = async (connection) => {
    const {browser, page} = await openBrowserWindow(dbSearchPageURL);

    const startStation = connection.start;
    const targetStation = connection.destination;
    const exactDepartureTime = moment(connection.exactConnection).format('HH:mm');
    const minDelay = connection.minDelay;
    await searchForConnections(page, startStation, targetStation, exactDepartureTime);
    await page.waitFor(2 * 1000);
    const content = await page.content();
    const delayMessages  = resultpage.parseContent(content, exactDepartureTime, minDelay);
    browser.close();
    return delayMessages;

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

module.exports = getDelayMessagesFor;
