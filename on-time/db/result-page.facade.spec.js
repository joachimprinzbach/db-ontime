const fs = require('fs');
const assert = require('assert');
const resultPage = require('./result-page.facade');

describe('resultPage', () => {
    describe('parseContent', () => {
        it('should return an empty array when no relevant delay has been found', (done) => {
            fs.readFile(__dirname + '/db-site.mock.html', 'utf8', (err, html) => {
                const expectedMessages = [];
                const exactDepartureTime = "22:52";
                const minDelay = 0;

                const messages = resultPage.parseContent(html, exactDepartureTime, minDelay);

                assert.deepEqual(expectedMessages, messages);
                done();
            });
        });

        it('should create a message when exactDepartureTime matches', (done) => {
            fs.readFile(__dirname + '/db-site.mock.html', 'utf8', (err, html) => {
                console.log(html);
                const expectedMessages = [
                    "*21:32 Uhr +4*\nMüllheim(Baden) → Basel, Bahnhof SBB\n"
                ];
                const exactDepartureTime = "21:32";
                const minDelay = 0;

                const messages = resultPage.parseContent(html, exactDepartureTime, minDelay);

                assert.deepEqual(messages, expectedMessages);
                done();
            });
        });


        it('should create a message when exactDepartureTime matches and delay is more than 5 minutes', (done) => {
            fs.readFile(__dirname + '/db-site.mock2.html', 'utf8', (err, html) => {
                const expectedMessages = [
                    "*21:32 Uhr +66*\nMüllheim(Baden) → Basel, Bahnhof SBB\n"
                ];
                const exactDepartureTime = "21:32";
                const minDelay = 0;

                const messages = resultPage.parseContent(html, exactDepartureTime, minDelay);

                assert.deepEqual(expectedMessages, messages);
                done();
            });
        });

        it('should not create a message when exactDepartureTime matches but minDelay is not exceeded', (done) => {
            fs.readFile(__dirname + '/db-site.mock.html', 'utf8', (err, html) => {
                const expectedMessages = [];
                const exactDepartureTime = "21:32";
                const minDelay = 5;

                const messages = resultPage.parseContent(html, exactDepartureTime, minDelay);

                assert.deepEqual(expectedMessages, messages);
                done();
            });
        });
    });

    describe('trainHasDelay', () => {
        it('should determine a delay correctly', () => {
            const delayTime = 5;
            const hardDelayTime = 5;
            const minDelay = 0;

            const hasDelay = resultPage.trainHasDelay(delayTime, hardDelayTime, minDelay);

            assert.equal(true, hasDelay);
        });

        it('should determine a delay correctly when minDelay is not too high', () => {
            const delayTime = 5;
            const hardDelayTime = 5;
            const minDelay = 5;

            const hasDelay = resultPage.trainHasDelay(delayTime, hardDelayTime, minDelay);

            assert.equal(false, hasDelay);
        });

        it('should determine a delay correctly when only hardDelay is higher than minDelay', () => {
            const delayTime = 1;
            const hardDelayTime = 20;
            const minDelay = 5;

            const hasDelay = resultPage.trainHasDelay(delayTime, hardDelayTime, minDelay);

            assert.equal(true, hasDelay);
        });

        it('should determine a delay correctly when only delay is higher than minDelay', () => {
            const delayTime = 10;
            const hardDelayTime = 0;
            const minDelay = 5;

            const hasDelay = resultPage.trainHasDelay(delayTime, hardDelayTime, minDelay);

            assert.equal(true, hasDelay);
        });
    });

    describe('exactTimeIsMatching', () => {
       it('should be an exact time when no exactDepartureTime is provided', () => {
           const scheduledStartTime = "21:13";
           const exactDepartureTime = undefined;

           const isExactTime = resultPage.exactTimeIsMatching(scheduledStartTime, exactDepartureTime);

           assert.equal(true, isExactTime);
       });

        it('should be an exact time when exactDepartureTime and scheduledStartTimeare equal', () => {
            const scheduledStartTime = "22:42";
            const exactDepartureTime = "22:42";

            const isExactTime = resultPage.exactTimeIsMatching(scheduledStartTime, exactDepartureTime);

            assert.equal(true, isExactTime);
        });

        it('should not be an exact time when exactDepartureTime and scheduledStartTimeare are different', () => {
            const scheduledStartTime = "22:42";
            const exactDepartureTime = "13:32";

            const isExactTime = resultPage.exactTimeIsMatching(scheduledStartTime, exactDepartureTime);

            assert.equal(false, isExactTime);
        });
    });
});