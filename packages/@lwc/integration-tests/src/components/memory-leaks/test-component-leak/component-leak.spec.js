/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* global globalThis */

const assert = require('assert');

// CDP only works in Chrome, not IE11. And it only works locally because of the DevTools Protocol usage
// See: https://webdriver.io/docs/devtools-service/
if (!/compat/.test(process.env.MODE) && !globalThis.IS_RUNNING_IN_SAUCE_LABS) {
    describe('Component does not leak', () => {
        const URL = '/component-leak';

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
            const functionDeclaration = /* istanbul ignore next */ function () {
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
            const addChild = await browser.shadowDeep$('integration-component-leak', '.add-child');
            const removeChildren = await browser.shadowDeep$(
                'integration-component-leak',
                '.remove-children'
            );

            const getNumChildren = () => {
                return document
                    .querySelector('integration-component-leak')
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
