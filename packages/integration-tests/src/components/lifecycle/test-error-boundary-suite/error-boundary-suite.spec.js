/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('error boundary integration', () => {
    const URL = 'http://localhost:4567/error-boundary-suite';
    before(() => {
        browser.url(URL);
    });

    it('should render alternative view if child throws in renderedCallback()', () => {
        browser.element('.boundary-child-rendered-throw').click();
        const altenativeView = browser.element('.rendered-calback-altenative');
        assert.equal(altenativeView.getText(), 'renderedCallback alternative view');

        // ensure offender has been unmounted
        assert.equal(browser.isExisting('integration-child-rendered-throw'), false);
    }),
        it('should render alternative view if child throws in render()', () => {
            browser.element('.boundary-child-render-throw').click();
            const altenativeView = browser.element('.render-altenative');
            assert.equal(altenativeView.getText(), 'render alternative view');

            // ensure offender has been unmounted
            assert.equal(browser.isExisting('integration-child-render-throw'), false);
        }),
        it('should render alternative view if child throws in constructor()', () => {
            browser.element('.boundary-child-constructor-throw').click();
            const altenativeView = browser.element('.constructor-altenative');

            assert.equal(altenativeView.getText(), 'constructor alternative view');
            // ensure offender has been unmounted
            assert.equal(browser.isExisting('integration-child-constructor-throw'), false);
            assert.equal(browser.isExisting('integration-child-constructor-wrapper'), false);
        }),
        it('should render alternative view if child throws in connectedCallback()', () => {
            browser.element('.boundary-child-connected-throw').click();
            const altenativeView = browser.element('.connected-callback-altenative');

            assert.equal(altenativeView.getText(), 'connectedCallback alternative view');
            // ensure offender has been unmounted
            assert.equal(browser.isExisting('integration-child-connected-throw'), false);
        });

    it('should render alternative view if child slot throws in render()', () => {
        browser.element('.boundary-child-slot-throw').click();
        const altenativeView = browser.element('.slot-altenative');

        assert.equal(altenativeView.getText(), 'slot alternative view');
        assert.equal(browser.isExisting('integration-child-slot-host'), false);
    }),
        it('should render alternative view if child throws during self rehydration cycle', () => {
            browser.element('.boundary-child-self-rehydrate-throw').click();
            browser.element('.self-rehydrate-trigger').click();
            const { value } = browser.executeAsync(function(done) {
                Promise.resolve().then(function() {
                    const altenativeViewContent = document.querySelector(
                        '.self-rehydrate-altenative'
                    ).textContent;
                    done(altenativeViewContent);
                });
            });
            assert.equal(value, 'self rehydrate alternative view');
            // ensure offender has been unmounted
            assert.equal(browser.isExisting('integration-child-self-rehydrate-throw'), false);
        }),
        it.skip('should render parent boundary`s alternative view when child boundary to render its alternative view', () => {
            browser.element('.nested-boundary-child-alt-view-throw').click();

            const { value } = browser.executeAsync(function(done) {
                Promise.resolve().then(function() {
                    const altenativeViewIsVisible =
                        document.querySelector('.boundary-alt-view') !== null;
                    done(altenativeViewIsVisible);
                });
            });
            assert.equal(value, true);
            // ensure offender has been unmounted
            assert.equal(browser.isExisting('integration-nested-post-error-child-view'), false);
        }),
        it('should fail to unmount alternatvie offender when root element is not a boundary', () => {
            browser.element('.boundary-alternative-view-throw').click();
            // ensure offender still exists since boundary failed to recover
            assert.equal(browser.isExisting('integration-post-error-child-view'), true);
        });
});
