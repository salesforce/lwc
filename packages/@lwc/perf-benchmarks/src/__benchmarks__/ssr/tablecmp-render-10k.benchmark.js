/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent } from '@lwc/ssr-runtime';

import { generateMarkup } from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/tableComponent/tableComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/store/store.js';

const SSR_MODE = 'asyncYield';

benchmark(`ssr/table-component/render/10k`, () => {
    run(() => {
        const store = new Store();
        store.runLots();

        return renderComponent(
            'benchmark-table',
            generateMarkup,
            {
                rows: store.data,
            },
            SSR_MODE
        );
    });
});
