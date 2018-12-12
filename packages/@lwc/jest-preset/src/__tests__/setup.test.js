/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Although `draggable` is a global attribute, it is not implemented in all browsers. This test relies
// on the fact that JSDOM does not implement `draggable` (as of 2018-08-13).
test('draggable HTML global attribute should be defined', () => {
    const el = document.createElement('div');
    el.setAttribute('draggable', 'true');

    expect('draggable' in el);
    expect(el.draggable).toBe('true');
});
