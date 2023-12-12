/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent, LightningElement } from '../index';

class Test extends LightningElement {}

describe('renderComponent', () => {
    it('returns the rendered tree as string', () => {
        expect(renderComponent('x-test', Test)).toBe(
            '<x-test><template shadowrootmode="open"></template></x-test>'
        );
    });

    it.each([undefined, null, 1, {}, () => {}])(
        'asserts the first parameter is a string (type: %p)',
        (value) => {
            expect(() => renderComponent(value as any, Test, {})).toThrow(
                `"renderComponent" expects a string as the first parameter but instead received ${value}.`
            );
        }
    );

    it.each([undefined, null, 1, 'test', {}])(
        'asserts the seconds parameter is a function (type: %p)',
        (value) => {
            expect(() => renderComponent('x-test', value as any, {})).toThrow(
                `"renderComponent" expects a valid component constructor as the second parameter but instead received ${value}.`
            );
        }
    );

    it.each([null, 1, 'test', () => {}])(
        'asserts the third parameter is an object (type: %p)',
        (value) => {
            expect(() => renderComponent('x-test', Test, value as any)).toThrow(
                `"renderComponent" expects an object as the third parameter but instead received ${value}.`
            );
        }
    );
});
