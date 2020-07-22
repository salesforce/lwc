/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const SELECTORS = {
    integrationFocus: 'integration-focus-dnd',
    dndDrag: '.dnd-drag',
    dndDrop: '.dnd-drop',
};

function getShadowActiveElements() {
    return browser.execute(() => {
        let active = document.activeElement;
        const res = [];

        if (active === null) {
            return res;
        }

        res.push(active.tagName);

        while (active.shadowRoot) {
            active = active.shadowRoot.activeElement;
            res.push(active.tagName);
        }

        return res;
    });
}

describe('Focus after drag and drop', () => {
    const URL = '/focus-dnd';

    before(() => {
        browser.url(URL);
    });

    it('should not focus elements in child (sanity check)', function () {
        let activeElements;

        browser.keys(['Tab']);

        activeElements = getShadowActiveElements();
        assert.deepEqual(
            activeElements,
            ['INTEGRATION-FOCUS-DND', 'BUTTON'],
            'Focusable button is expected to be focused.'
        );

        browser.keys(['Tab']);

        activeElements = getShadowActiveElements();
        assert.deepEqual(activeElements, ['BODY'], 'Body is expected to be focused.');
    });

    it('should not focus elements in child after drag and drop', () => {
        let activeElements;

        const draggable = $(SELECTORS.integrationFocus).shadow$(SELECTORS.dndDrag);
        const dropZone = $(SELECTORS.integrationFocus).shadow$(SELECTORS.dndDrop);

        draggable.dragAndDrop(dropZone);

        activeElements = getShadowActiveElements();
        assert.deepEqual(activeElements, ['INTEGRATION-FOCUS-DND', 'DIV']);

        // Wait for 1 second before and after tabbing to make sure the focus event has been moved.
        // For some strange reasons, the focus takes time to update after the drag-and-drop.
        browser.pause(1000);
        browser.keys(['Tab']);
        browser.pause(1000);

        activeElements = getShadowActiveElements();
        assert.deepEqual(activeElements, ['BODY']);
    });
});
