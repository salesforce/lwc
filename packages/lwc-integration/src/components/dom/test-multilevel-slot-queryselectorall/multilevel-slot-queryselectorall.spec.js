const assert = require('assert');
describe('Multi-level slot query selector', () => {
    const URL = 'http://localhost:4567/multilevel-slot-queryselectorall';

    before(() => {
        browser.url(URL);
    });

    describe('parent', () => {
        it('should be able to see div', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-parent').selectAll('div').length === 1
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-parent').selectAll('integration-custom').length === 1
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom span', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-parent').selectAll('span').length === 1
            }).value
            assert.equal(canSee, false);
        });
    });

    describe('child', () => {
        it('should be able to see div', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-child').selectAll('div').length === 1
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-child').selectAll('integration-custom').length === 1
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom span', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-child').selectAll('span').length === 1
            }).value
            assert.equal(canSee, false);
        });
    });
});
