/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import Apex from 'example/apex';

afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('example-apex', () => {
    describe('importing @salesforce/apex', () => {
        it('returns a Promise that resolves for the default import', () => {
            const element = createElement('example-apex', { is: Apex });
            document.body.appendChild(element);
            const apexCall = element.callDefaultImport();
            return apexCall.then(ret => {
                expect(ret).toBe('from test');
            });
        });

        it('returns a Promise that resolves for a second imported Apex method', () => {
            const element = createElement('example-apex', { is: Apex });
            document.body.appendChild(element);
            const apexCall = element.callAnotherDefaultImport();
            return apexCall.then(ret => {
                expect(ret).toBe('from test');
            });
        });

        it('returns a Promise that resolves for the refreshApex named import', () => {
            const element = createElement('example-apex', { is: Apex });
            document.body.appendChild(element);
            const refreshApex = element.callRefreshApex();
            return refreshApex.then(ret => {
                expect(ret).toBe('from test');
            });
        });
    });
});
