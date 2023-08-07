/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Event target in slot elements', () => {
    const URL = '/slotted-event-target/';

    before(async () => {
        await browser.url(URL);
    });

    it('should receive event with correct target', async () => {
        const select = await browser.shadowDeep$('integration-slotted-event-target', 'select');
        await select.selectByVisibleText('Second');

        const element = await browser.shadowDeep$(
            'integration-slotted-event-target',
            '.target-is-select'
        );
        assert.strictEqual(await element.getText(), 'Event Target is select element');
    });
});
