const cheerio = require('cheerio');
const delayThreshold = 0;

const getDelayMessages = async (page, exactDepartureTime) => {
    const messages = [];
    await page.waitForSelector('span.ontime');
    await page.waitFor(2 * 1000);

    const resultSelector = '#resultsOverview';
    const content = await page.content();
    const $ = cheerio.load(content);
    const connections = $(resultSelector).children('.boxShadow.scheduledCon');
    connections.each((index, connection) => {
        const tableRows = $(connection).children('tr');
        const departureRow = $(tableRows).eq(0).children('td');
        const arrivalRow = $(tableRows).eq(1).children('td');
        const scheduledStartTime = $(departureRow).eq(1);
        const startStationName = $(departureRow).eq(0).text();
        const destinationStationName = $(arrivalRow).eq(0).text();
        const scheduledDepartureTime = $(scheduledStartTime).clone().children().remove().end().text();
        const delay = $(scheduledStartTime).children('span.ontime').first().text();
        const delayTime = parseInt(delay.replace(/\+/g, ''), 10);
        if (trainHasDelay(delayTime) && exactTimeIsMatching(scheduledDepartureTime, exactDepartureTime)) {
            const text = "*VERSPÄTUNG!*\n" + scheduledDepartureTime + " Uhr\nvon: " + startStationName.trim() + "\nnach: " + destinationStationName.trim() + "\n*" + delayTime + " Minuten*";
            messages.push(text);
            console.log(text);
        }
    });
    return messages;
};

const trainHasDelay = delayTime => {
    return delayTime > delayThreshold;
};

const exactTimeIsMatching = (scheduledStartTime, exactDepartureTime) => {
    if(!exactDepartureTime) {
        return true;
    }
    return scheduledStartTime == exactDepartureTime;
};

module.exports = getDelayMessages;