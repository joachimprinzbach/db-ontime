const sinon = require('sinon');
const moment = require('moment');
const assert = require('assert');
const crawl = require('./crawl');

describe('crawl', () => {
    let botFake = {
        sendMessage: (id, msg, options) => {
        }
    };
    let botStub;

    beforeEach(() => {
        botStub = sinon.stub(botFake, 'sendMessage');
    });

    afterEach(() => {
        botStub.restore();
    });

    describe('shouldCheckForDelaysOf', () => {
        it('should determine timeframe correctly', () => {
            let MONDAY_6_32 = 1512365544000;
            moment.now = function () {
                return MONDAY_6_32;
            };
            const connection = {
                runOnWeekend: false,
                crawlStart: {
                    "hour": "6",
                    "minute": "1"
                },
                crawlEnd: {
                    "hour": "6",
                    "minute": "40"
                }
            };

            const shouldCheck = crawl.shouldCheckForDelaysOf(connection);

            assert.equal(true, shouldCheck);
        });

        it('should not run outside of timeframe', () => {
            let MONDAY_6_32 = 1512365544000;
            moment.now = function () {
                return MONDAY_6_32;
            };
            const connection = {
                runOnWeekend: false,
                crawlStart: {
                    "hour": "6",
                    "minute": "40"
                },
                crawlEnd: {
                    "hour": "7",
                    "minute": "40"
                }
            };

            const shouldCheck = crawl.shouldCheckForDelaysOf(connection);

            assert.equal(false, shouldCheck);
        });

        it('should be possible to check weekends', () => {
            let SUDNAY_6_32 = 1512279144000;
            moment.now = function () {
                return SUDNAY_6_32;
            };
            const connection = {
                runOnWeekend: true,
                crawlStart: {
                    "hour": "6",
                    "minute": "1"
                },
                crawlEnd: {
                    "hour": "6",
                    "minute": "40"
                }
            };

            const shouldCheck = crawl.shouldCheckForDelaysOf(connection);

            assert.equal(true, shouldCheck);
        });

        it('should not run on weekends weekends', () => {
            let SUDNAY_6_32 = 1512279144000;
            moment.now = function () {
                return SUDNAY_6_32;
            };
            const connection = {
                runOnWeekend: false,
                crawlStart: {
                    "hour": "6",
                    "minute": "1"
                },
                crawlEnd: {
                    "hour": "6",
                    "minute": "40"
                }
            };

            const shouldCheck = crawl.shouldCheckForDelaysOf(connection);

            assert.equal(false, shouldCheck);
        });
    });

    describe('sendDelayMessagesToChatRoom', () => {
        it('should send multiple messages', async () => {
            const chatRoomId = 'id';
            const messages = ['msg1', 'second message'];

            await crawl.sendDelayMessagesToChatRoom(botFake, chatRoomId, messages);

            sinon.assert.calledTwice(botStub);
            sinon.assert.calledWith(botStub, chatRoomId, messages[0], {parse_mode: 'Markdown'});
            sinon.assert.calledWith(botStub, chatRoomId, messages[1], {parse_mode: 'Markdown'});
        });

        it('should not send messages with telegram when no msg has ben created', async () => {
            const chatRoomId = 'id';
            const messages = [];

            await crawl.sendDelayMessagesToChatRoom(botFake, chatRoomId, messages);

            sinon.assert.notCalled(botStub);
        });

    });

    describe('crawlForDelays', () => {
        it('should not do anything when no connections are configured', async () => {
            const connections  = [];

            await crawl.crawlForDelays(botFake, connections);

            sinon.assert.notCalled(botStub);
        });
    })
});

