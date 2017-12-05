const fs = require('fs');
const assert = require('assert');
const cheerio = require('cheerio');
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
                const expectedMessages = [
                    "*\n                        \n                        21:32 Uhr +2*\nM�llheim(Baden) → Basel, Bahnhof SBB\n"
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
});