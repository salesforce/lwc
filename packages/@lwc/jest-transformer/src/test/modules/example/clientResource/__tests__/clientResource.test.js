/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import ClientResource from 'example/clientResource';

describe('example-client-resource', () => {
    describe('@salesforce/client/formFactor', () => {
        it('should be a valid import in a component', () => {
            const element = createElement('example-client-resource', { is: ClientResource });

            const value = element.getFormFactorValue();
            expect(value).toBe('Large');
        });
    });
});
