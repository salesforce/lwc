/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import StaticComponent from '@lwc/perf-benchmarks-components/dist/dom/benchmark/staticComponent/staticComponent.js';
import { createElement } from '@lwc/engine-dom';
import { destroyComponent } from '../../../utils/utils.js';

const NUM_COMPONENTS = 10000;

benchmark(`dom/static-component/10k`, () => {
    const elms = [];

    run(async () => {
        for (let i = 0; i < NUM_COMPONENTS; i++) {
            const elm = createElement('static-component', {
                is: StaticComponent,
            });
            document.body.appendChild(elm);
            await Promise.resolve();
            elms.push(elm);
        }
    });

    after(() => {
        for (const elm of elms) {
            destroyComponent(elm);
        }
    });
});
