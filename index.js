const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const url = 'https://www.bahn.de/p/view/index.shtml';
const apiToken = '416417756:AAGax9aSZBoiM2PnHstUkPulJbJJYX-Tkvc';
const bot = new TelegramBot(apiToken, {polling: false});

const startStation = 'Müllheim (Baden)';
const targetStation = 'Basel SBB';

const app = require("express")();
const port = process.env.PORT || 4201;
let salutation = "hans"; // our new variable
bot.sendMessage(11701970, "App up and running");
app.get("/", (req, res) => {
    res.send(`
    <h1>Hello, ${salutation}!</h1>
    <h2>Express server is up and running on port ${port}</h2>
    `);
    console.info(`Route '/' was called`)
});

const fetchIt = async function() {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    console.log("brwoser launched");
    const page = await browser.newPage();
    console.log("page opened");
    page.setViewport({width: 1200, height: 900});

    await page.goto(url, {waitUntil: 'networkidle'});

    const startInput = await page.$('#js-auskunft-autocomplete-from');
    await startInput.click();
    await page.type(startStation);

    const targetInput = await page.$('#js-auskunft-autocomplete-to');
    await targetInput.click();
    await page.type(targetStation);

    const submit = await page.$('.js-submit-btn');
    await submit.click();

    await page.waitForSelector('span.ontime');

    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('td.time'));
        return anchors.map(anchor => anchor.textContent);
    });
    let message = links.join('\n');
    console.log(message);
    bot.sendMessage(11701970, message);
    browser.close();
}
app.listen(port, () => {
    try {
        console.log("Express app listening on port:", port);
        // mute setInterval(fetchIt, 5000);
    } catch(e) {
        console.log(e);
    }
});

module.exports = app;