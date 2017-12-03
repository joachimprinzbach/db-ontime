const getChatRoomId = (connection) => {
    const chatId = "TELEGRAM_CHAT_ID_" + connection.connectionId;
    return process.env[chatId] || connection.chatId;
};

module.exports = getChatRoomId;
