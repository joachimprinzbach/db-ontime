const onTime = require('./on-time/crawl');
const sinon = require('sinon');
const moment = require('moment');
const assert = require('assert');

describe('On Time', () => {
    xit('should work', async () => {
        await onTime(START_STATION, TARGET_STATION, shouldRunOnWeekend, spy);

        assert.equal(1, spy.callCount);
        assert.equal(false, spy.args[0][0]);
        assert.equal(shouldRunOnWeekend, spy.args[0][1]);
        assert.equal('07:49', spy.args[0][2]);
        assert.equal(false, spy.args[0][3]);
        assert.equal(START_STATION, getStartStationValue(spy));
        assert.equal(TARGET_STATION, getTargetStationValue(spy));
    });
});

const getStartStationValue = spy => {
    return spy.args[0][4];
};

const getTargetStationValue = spy => {
    return spy.args[0][5];
};