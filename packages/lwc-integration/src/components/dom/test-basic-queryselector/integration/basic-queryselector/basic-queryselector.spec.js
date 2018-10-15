const assert = require('assert');

const URL = 'http://localhost:4567/basic-queryselector';
browser.url(URL);

describe('querySelector', () => {
    it.skip('should return an element from the light dom', () => {
        assert.deepEqual(
            browser.element('.query-selector').getText(),
            'querySelector: first slotted content'
        );
    });
});

describe('querySelectorAll', () => {
    it.skip('should return elements from the light dom', () => {
        assert.deepEqual(
            browser.element('.query-selector-all').getText(),
            'querySelectorAll: first slotted content second slotted content'
        );
    });
});
