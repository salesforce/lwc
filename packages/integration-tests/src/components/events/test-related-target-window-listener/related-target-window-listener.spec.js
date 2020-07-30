/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('relatedTarget of event in listener attached to window', () => {
    const URL = '/related-target-window-listener';
    before(() => {
        browser.url(URL);
    });
    it('should not throw when accessing relatedTarget of a mouseevent in window listener', () => {
        // Should be run in non-headless mode, needs to simulate mousemove event
        browser.keys(['Tab']);
        const input = $('integration-related-target-window-listener').shadow$('.second-input');
        input.moveTo();
        browser.waitUntil(() => {
            const testStatus = $('integration-related-target-window-listener')
                .shadow$('.test-status')
                .getText();
            // Mouseout listener should be invoked twice
            // Once when moving from Input to host shadow
            // Next when moving from host shadow to 2nd Input
            return testStatus === 'INPUT;INTEGRATION-RELATED-TARGET-WINDOW-LISTENER;';
        });
    });
});
