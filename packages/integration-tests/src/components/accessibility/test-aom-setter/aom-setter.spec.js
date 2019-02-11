/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Component AOM Setter', () => {
    const URL = 'http://localhost:4567/aom-setter';

    before(() => {
        browser.url(URL);
    });

    it('should correctly call setter for AOM property', function () {
        const element = browser.element('.internal-label');
        let ariaLabel;
        browser.execute(function() {
            // "browser.element('x-child').getAttribute('aria-label')" returns
            // empty string in test but null in real browser, use this command
            // as a workaround to verify attribute is not set.
            ariaLabel = HTMLElement.prototype.getAttribute.call(document.querySelector('integration-child'), 'aria-label');
        });
        assert.equal(ariaLabel, null);
        assert.equal( element.getText(), 'label');
    });
});
