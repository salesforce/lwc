const assert = require('assert');
describe('Testing component: record-layout', () => {
    const URL = 'http://localhost:4567/record-layout';
    let element;

    before(() => {
        browser.url(URL);
        element = browser.element('record-layout');
    });

    it('page load', () => {
        const title = browser.getTitle();
        assert.equal(title, 'record-layout');
        assert.ok(element);
    });

    describe('Record Layout section', function () {
        it('should display titleLabel correctly', function () {
            const element = browser.element('record-layout-section p');
            assert.strictEqual(element.getText(), 'Section: Opportunity Information');
        });
    });

    describe('Record layout leaf', function () {
        it('should display field-api-name correctly', function () {
            const element = browser.element('record-layout-row:nth-child(4) record-layout-leaf p:nth-child(3)');
            assert.strictEqual(element.getText(), 'Field Api Name: AccountId');
        });

        it('should display display-value correctly', function () {
            const element = browser.element('record-layout-row:nth-child(4) record-layout-leaf p:nth-child(2)');
            assert.strictEqual(element.getText(), 'Display value: Acme');
        });

        it('should display value correctly', function () {
            const element = browser.element('record-layout-row:nth-child(4) record-layout-leaf p:nth-child(1)');
            assert.strictEqual(element.getText(), 'Value: 001xx000003DIIxAAO');
        });
    });
});
