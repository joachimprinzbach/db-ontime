const crawl = require('./crawl');
const moment = require('moment');
const assert = require('assert');

describe('crawl', () => {
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
});