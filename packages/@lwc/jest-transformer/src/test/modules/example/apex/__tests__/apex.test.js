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
    it('default import is resolved Promise', () => {
        const element = createElement('example-apex', { is: Apex });
        document.body.appendChild(element);
        const apexCall = element.callDefaultImport();
        return apexCall.then((ret) => {
            expect(ret).toBe('from test');
        })
    });

    it('can import and call multiple default Apex imports', () => {
        const element = createElement('example-apex', { is: Apex });
        document.body.appendChild(element);
        const apexCall = element.callDefaultImport2();
        return apexCall.then((ret) => {
            expect(ret).toBe('from test');
        })
    });

    it('refreshApex is resolved Promise', () => {
        const element = createElement('example-apex', { is: Apex });
        document.body.appendChild(element);
        const refreshApex = element.callRefreshApex();
        return refreshApex.then((ret) => {
            expect(ret).toBe('from test');
        });
    });
});
