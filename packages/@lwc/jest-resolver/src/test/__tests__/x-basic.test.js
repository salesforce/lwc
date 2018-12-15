/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import Basic from '../x-basic';

describe('x-basic', () => {
    it('loads basic component', () => {
        const element = createElement('x-basic', { is: Basic });
        expect(element).toBe(element);
    });
});
