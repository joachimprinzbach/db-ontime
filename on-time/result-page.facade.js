const cheerio = require('cheerio');
const delayThreshold = 0;

const getDelayMessages = async (page, exactDepartureTime) => {
    const messages = [];
    await page.waitForSelector('span.ontime');
    await page.waitFor(2 * 1000);
    await page.screenshot({path: 'screenshot.png'});
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
        const hardDelay = $(scheduledStartTime).children('span.delay').first().text();
        const delayTime = parseInt(delay.replace(/\+/g, ''), 10);
        const hardDelayTime = parseInt(hardDelay.replace(/\+/g, ''), 10);
        logConnectionInfo(startStationName, destinationStationName, scheduledDepartureTime, delayTime);
        if (trainHasDelay(delayTime, hardDelayTime) && exactTimeIsMatching(scheduledDepartureTime, exactDepartureTime)) {
            console.log(hardDelayTime);
            console.log(delayTime);
            let finalDelayTime = hardDelayTime;
            if (isNaN(hardDelayTime)) {
                finalDelayTime = delayTime;
            }
            const text = "*+" + finalDelayTime + " - VERSPÄTUNG!*\n" + scheduledDepartureTime + " Uhr\nvon: " + startStationName.trim() + "\nnach: " + destinationStationName.trim() + "\n*" + finalDelayTime + " Minuten*";
            messages.push(text);
            console.log(text);
        }
    });
    return messages;
};

const trainHasDelay = (delayTime, hardDelayTime) => {
    const hasDelay = (delayTime > delayThreshold) || (hardDelayTime > delayThreshold);
    return hasDelay;
};

const exactTimeIsMatching = (scheduledStartTime, exactDepartureTime) => {
    if (!exactDepartureTime) {
        return true;
    }
    return scheduledStartTime.trim() == exactDepartureTime.trim();
};

const logConnectionInfo = (startStationName, destinationStationName, scheduledDepartureTime, delayTime) => {
    console.log('Connection from ' + startStationName + ' to ' + destinationStationName + ' at ' + scheduledDepartureTime + ' has a delay of: ' + delayTime);
};

module.exports = getDelayMessages;
