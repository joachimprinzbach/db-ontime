const getDelayMessagesFor = require('./db/db.facade');
const getChatRoomId = require('./chat-room.repository');
const moment = require('moment-timezone');
moment.locale('de');
moment.tz.setDefault("Europe/Berlin");

const crawlForDelays = async (bot, connections) => {
    for (let connection of connections) {
        if (shouldCheckForDelaysOf(connection)) {
            const chatRoomId = getChatRoomId(connection);
            const messages = await getDelayMessagesFor(connection);
            await sendDelayMessagesToChatRoom(bot, chatRoomId, messages);
        } else {
            console.log('Not checking. Outside of time window.');
        }
    }
};

const sendDelayMessagesToChatRoom = async (bot, chatRoomId, messages) => {
    messages.forEach(msg => {
        console.log('Sending Telegram msg: ', msg);
        bot.sendMessage(chatRoomId, msg, {parse_mode: 'Markdown'});
    });
    if (messages.length == 0) {
        console.log('No delays found.');
    }
};

const shouldCheckForDelaysOf = (connection) => {
    const now = moment();
    const startCrawlTime = moment(connection.crawlStart);
    const finishCrawlTime = moment(connection.crawlEnd);
    const isWorkingDay = !(now.weekday() == 5 || now.weekday() == 6);
    const isInTimeFrame = now.isBetween(startCrawlTime, finishCrawlTime);
    return (isWorkingDay || connection.runOnWeekend) && isInTimeFrame;
};

module.exports = {
    crawlForDelays,
    sendDelayMessagesToChatRoom,
    shouldCheckForDelaysOf
};
