const assert = require('assert');
describe('Multi-level slot query selector', () => {
    const URL = 'http://localhost:4567/multilevel-slot-queryselector';

    before(() => {
        browser.url(URL);
    });

    describe('parent', () => {
        it('should be able to see div', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-parent').select('div') !== null
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-parent').select('integration-custom') !== null
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom span', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-parent').select('span') !== null
            }).value
            assert.equal(canSee, false);
        });
    });

    describe('child', () => {
        it('should be able to see div', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-child').select('div') !== null
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-child').select('integration-custom') !== null
            }).value
            assert.equal(canSee, true);
        });

        it('should be able to see integration-custom span', () => {
            const canSee = browser.execute(function () {
                return document.querySelector('integration-child').select('span') !== null
            }).value
            assert.equal(canSee, false);
        });
    });
});
