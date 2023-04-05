/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const assert = require('assert');

//
// This test captures a bug (https://github.com/salesforce/lwc/issues/3361) that was triggered by certain conditions:
//
// 1) A component is inserted and then removed from the dom using `container.innerHTML = ''`
// 2) The component has HTML, CSS, and JS (Notably CSS)
// 3) We're running in dev mode
//
// This test could also fail if a new memory leak is _introduced_, but it also detects that prior bug.
//

// CDP only works in Chrome. And it only works locally because of the DevTools Protocol usage, so if
// tunnelIdentifier exists, we know we're running in Sauce Labs and should bail out.
// See: https://webdriver.io/docs/devtools-service/
if (browser.capabilities.browserName === 'chrome' && !browser.capabilities.tunnelIdentifier) {
    // TODO [#3393]: re-enable once Circle CI can handle CDP again
    describe.skip('Component does not leak', () => {
        const URL = '/lifecycle-leak';

        // Count the number of objects using queryObjects(). Based on:
        // https://media-codings.com/articles/automatically-detect-memory-leaks-with-puppeteer
        async function getObjectsCount() {
            const protoResult = await browser.cdp('Runtime', 'evaluate', {
                expression: 'VeryUniqueObjectName.prototype',
            });
            const protoObjectId = protoResult.result.objectId;

            // Query all objects for Object.prototype
            const queryObjectsResult = await browser.cdp('Runtime', 'queryObjects', {
                prototypeObjectId: protoObjectId,
            });

            const queriedObjectsObjectId = queryObjectsResult.objects.objectId;

            // Call .length on the returned array
            const functionDeclaration = function () {
                return this.length;
            }.toString();

            const callFunctionOnResult = await browser.cdp('Runtime', 'callFunctionOn', {
                objectId: queriedObjectsObjectId,
                functionDeclaration,
                returnByValue: true,
            });
            const res = callFunctionOnResult.result.value;

            // cleanup so we don't leak memory ourselves
            await Promise.all([
                browser.cdp('Runtime', 'releaseObject', { objectId: protoObjectId }),
                browser.cdp('Runtime', 'releaseObject', { objectId: queriedObjectsObjectId }),
            ]);

            return res;
        }

        before(async () => {
            await browser.url(URL);
        });

        it('should not leak', async () => {
            const addChild = await browser.shadowDeep$('integration-lifecycle-leak', '.add-child');
            const removeChildren = await browser.shadowDeep$(
                'integration-lifecycle-leak',
                '.remove-children'
            );

            const getNumChildren = () => {
                return document
                    .querySelector('integration-lifecycle-leak')
                    .shadowRoot.querySelectorAll('integration-child').length;
            };

            const countBefore = await getObjectsCount();
            const numChildrenBefore = await browser.execute(getNumChildren);

            await addChild.click();
            await removeChildren.click();

            await browser.cdp('HeapProfiler', 'collectGarbage');

            const countAfter = await getObjectsCount();
            const numChildrenAfter = await browser.execute(getNumChildren);

            // We expect the number of DOM elements attached to the DOM to be the same
            // And for there to be no detached objects in the heap
            assert.equal(numChildrenAfter, numChildrenBefore);
            assert.equal(countAfter, countBefore);
        });
    });
}
