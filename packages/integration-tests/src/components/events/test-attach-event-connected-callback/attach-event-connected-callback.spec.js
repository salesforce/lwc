/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Issue 657: Cannot attach event in `connectedCallback`', () => {
    const URL = 'http://localhost:4567/attach-event-connected-callback';

    before(() => {
        browser.url(URL);
    });

    it('clicking force button should update value', function () {
        const button = browser.element('button');
        button.click();
        const p = browser.element('p');
        assert.deepEqual(p.getText(), 'Was clicked: true');
    });
});
