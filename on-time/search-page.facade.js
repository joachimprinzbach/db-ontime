const toSelector = '#js-auskunft-autocomplete-to';
const fromSelector = '#js-auskunft-autocomplete-from';
const searchButtonSelector = '.js-submit-btn';
const timeSelector = '#js-auskunft-timeinput > input.center-inline';

const searchForConnections = async (page, startStation, targetStation, exactDepartureTime) => {
    await insertText(page, fromSelector, startStation);
    await insertText(page, toSelector, targetStation);
    await insertTime(page, exactDepartureTime);

    const searchButton = await page.$(searchButtonSelector);
    await searchButton.click();
};

async function insertTime(page, exactDepartureTime) {
    const timeInput = await page.$(timeSelector);
    await timeInput.click();
    page.keyboard.press('ArrowRight');
    page.keyboard.press('ArrowRight');
    page.keyboard.press('ArrowRight');
    page.keyboard.press('ArrowRight');
    page.keyboard.press('ArrowRight');
    page.keyboard.press('Backspace');
    page.keyboard.press('Backspace');
    page.keyboard.press('Backspace');
    page.keyboard.press('Backspace');
    page.keyboard.press('Backspace');
    await page.type(timeSelector, exactDepartureTime);
}

const insertText = async (page, selector, value) => {
    const input = await page.$(selector);
    await input.click();
    await page.type(selector, value);
};

module.exports = searchForConnections;