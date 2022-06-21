/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/mouseover';

if (process.env.COMPAT === 'false') {
    describe('mouseover', () => {
        beforeEach(async () => {
            await browser.url(URL);
        });

        it('should be able to trigger programmatic mouseover', async () => {
            const component = await browser.$('integration-mouseover');
            const elementToHover = await component.shadow$('.mouseover');
            // This might seem like a roundabout way to mouse over an element, but this puts ChromeDriver into the
            // code path where it calls elementsFromPoint, which is what we're trying to test:
            // https://github.com/bayandin/chromedriver/blob/ad6ede8/js/get_element_location.js#L122
            await browser.performActions([
                {
                    type: 'pointer',
                    id: 'finger1',
                    parameters: { pointerType: 'mouse' },
                    actions: [
                        {
                            duration: 250,
                            origin: {
                                'element-6066-11e4-a52e-4f735466cecf': elementToHover.elementId,
                            },
                            type: 'pointerMove',
                            x: 0,
                            y: 0,
                        },
                    ],
                },
            ]);

            const successElement = await component.shadow$('.hovering');
            const exists = await successElement.isExisting();
            assert.strictEqual(exists, true);
        });
    });
}
