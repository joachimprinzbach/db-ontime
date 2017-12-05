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
});