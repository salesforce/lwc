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
export function styledComponentBenchmark(name, numComponents, componentOrComponents) {
    benchmark(name, () => {
        const elms = [];

        const isArray = Array.isArray(componentOrComponents);

        run(async () => {
            for (let i = 0; i < numComponents; i++) {
                const elm = createElement(isArray ? `styled-component${i}` : 'styled-component', {
                    is: isArray ? componentOrComponents[i] : componentOrComponents,
                });
                document.body.appendChild(elm);
                elms.push(elm);
            }
        });

        after(() => {
            for (const elm of elms) {
                destroyComponent(elm);
            }
        });
    });
}
