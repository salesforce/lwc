/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import target from '../static-class-attr';

describe('module/static-class-attr', () => {
    it('should apply data.classMap', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: { classMap: { foo: true } } };

        target.create(vnode);
        expect(elm.className).toBe('foo');
    });

    it('should preserve other classnames', () => {
        const elm = document.createElement('p');
        elm.className = 'manual';
        const vnode = { elm, data: { classMap: { foo: true, bar: true } } };

        target.create(vnode);
        expect(elm.className).toBe('manual foo bar');
    });
});
