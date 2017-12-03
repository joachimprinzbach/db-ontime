const getDelayMessagesFor = require('./db-facade');
const getChatRoomId = require('./chat-room.repository');
const moment = require('moment-timezone');
const config = require('../config.json');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN || config.token;
const bot = new TelegramBot(token, {polling: false});
moment.locale('de');
moment.tz.setDefault("Europe/Berlin");

const crawlForDelays = async () => {
    for (let connection of config.connections) {
        if (shouldCheckForDelaysOf(connection)) {
            const chatRoomId = getChatRoomId(connection);
            const messages = await getDelayMessagesFor(connection);
            await sendDelayMessagesToChatRoom(chatRoomId, messages);
        } else {
            console.log('Not checking. Outside of time window.');
        }
    }
};

const sendDelayMessagesToChatRoom = async (chatRoomId, messages) => {
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

module.exports = crawlForDelays;
