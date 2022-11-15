/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';
import { destroyComponent } from './utils.js';

// Generic benchmark for styled components
// Unfortunately the after/benchmark/run APIs have to be passed in here; otherwise Best won't build the code correctly
export function styledComponentBenchmark(
    name,
    numComponents,
    componentOrComponents,
    { after, benchmark, run }
) {
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
