/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

function shadowDomQuerySelector(browser, selectors) {
    return browser.execute(function(selectors) {
        var current;

        for (var i = 0; i < selectors.length; i++) {
            var selector = selectors[i];

            if (!current) {
                current = document.querySelector(selector);
            } else {
                var root = current.shadowRoot || current;
                current = root.querySelector(selector);
            }
        }

        return current;
    }, selectors);
}

function testStyles(nativeShadow) {
    const BASE_URL = 'http://localhost:4567/inject-style';

    before(() => {
        browser.url(BASE_URL + (nativeShadow ? '?nativeShadow=true' : ''));
    });

    it(`doens't leak styles on children component`, () => {
        const parentDiv = shadowDomQuerySelector(browser, ['integration-inject-style', 'div']);
        const parentColor = parentDiv.getCssProperty('color');
        assert.equal(parentColor.parsed.hex, '#00ff00');

        const childDiv = shadowDomQuerySelector(browser, [
            'integration-inject-style',
            'integration-child',
            'div',
        ]);
        const childColor = childDiv.getCssProperty('color');
        assert.notEqual(childColor.parsed.hex, '#00ff00');
    });

    it(`injects the style before the component is rendered`, () => {
        const dimensionElm = shadowDomQuerySelector(browser, [
            'integration-inject-style',
            '.dimensions',
        ]);
        const dimensions = dimensionElm.getText();

        assert.equal(dimensions, '300x300');
    });

    it(`apply :host selector to the host element`, () => {
        const rootElement = browser.element('integration-inject-style');
        const rootElementBackground = rootElement.getCssProperty('background-color');
        assert.equal(rootElementBackground.parsed.hex, '#ff0000');
    });

    it(`apply :host() only if the selector match`, () => {
        const styledTitle = shadowDomQuerySelector(browser, [
            'integration-inject-style',
            'integration-child[data-title-yellow]',
            'h1',
        ]);
        const styledTitleColor = styledTitle.getCssProperty('color');
        assert.equal(styledTitleColor.parsed.hex, '#ffff00');

        const unstyledTitle = shadowDomQuerySelector(browser, [
            'integration-inject-style',
            'integration-child:not([data-title-yellow])',
            'h1',
        ]);
        const unstyledTitleColor = unstyledTitle.getCssProperty('color');
        assert.equal(unstyledTitleColor.parsed.hex, '#000000');
    });
}

describe('Style injection', () => {
    describe('synthetic shadow', () => testStyles(false));

    // TODO: We need a way to use Selenium with LWC when running in `dev` mode.
    // This test will not pass in `dev` mode since we apply some restrictions on the shadowRoot in `dev`
    // mode only. This test pass on the CI since it runs the integration tests in production mode only.
    if (process.env.MODE && !process.env.MODE.includes('compat')) {
        describe('native shadow', () => testStyles(true));
    }
});
