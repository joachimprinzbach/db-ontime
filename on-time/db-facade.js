const searchForConnections = require('./search-page.facade');
const getDelayMessages = require('./result-page.facade');

const getDelays = async (page, startStation, targetStation, exactDepartureTime) => {
        await searchForConnections(page, startStation, targetStation, exactDepartureTime);
        return getDelayMessages(page, exactDepartureTime);
};

module.exports = getDelays;
