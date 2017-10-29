const toSelector = '#js-auskunft-autocomplete-to';
const fromSelector = '#js-auskunft-autocomplete-from';
const searchButtonSelector = '.js-submit-btn';

const searchForConnections = async (page, startStation, targetStation) => {
    await insertText(page, fromSelector, startStation);
    await insertText(page, toSelector, targetStation);

    const searchButton = await page.$(searchButtonSelector);
    await searchButton.click();
};

const insertText = async (page, selector, value) => {
    const input = await page.$(selector);
    await input.click();
    await page.type(selector, value);
};

module.exports = searchForConnections;