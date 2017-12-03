const chatRoom = require('./chat-room.repository');
const assert = require('assert');

describe('Chat room repository', () => {
    it('should return the correct chatId when no environment variable is set', () => {
        const connection = {
            chatId: 'some ID',
            connectionId: '2'
        };

        const chatId = chatRoom(connection);

        assert.equal('some ID', chatId);
    });

    it('should return the correct chatId when environment variable is set', () => {
        const connection = {
            chatId: 'some ID',
            connectionId: '2'
        };
        process.env['TELEGRAM_CHAT_ID_' + connection.connectionId] = 'process ID';

        const chatId = chatRoom(connection);

        assert.equal('process ID', chatId);
    });
});
