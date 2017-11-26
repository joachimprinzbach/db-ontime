const app = require("express")();
const port = process.env.PORT || 4201;
const config = require('./config.json');
const crawl = require('./on-time/crawl');

app.listen(port, () => {
    const delay = 1000 * 60 * config.delay;
    try {
        const crawlFunc = crawl.bind(this);
        crawlFunc();
        setInterval(crawlFunc, delay);
    } catch (error) {
        console.error("Error occurred: ", error);
    }
});

module.exports = app;