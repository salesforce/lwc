/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';
import { destroyComponent } from './utils.js';
import { benchmark, run, after } from './benchmark-framework.js';

// Generic benchmark for styled components
export function styledComponentBenchmark(name, componentOrComponents) {
    benchmark(name, () => {
        const elms = [];

        const isArray = Array.isArray(componentOrComponents);

        run(() => {
            for (let i = 0; i < 1000; i++) {
                const elm = createElement(isArray ? `styled-component${i}` : 'styled-component', {
                    is: isArray ? componentOrComponents[i] : componentOrComponents,
                });
                document.body.appendChild(elm);
                elms.push(elm);
            }
            return Promise.resolve();
        });

        after(() => {
            for (const elm of elms) {
                destroyComponent(elm);
            }
        });
    });
}
