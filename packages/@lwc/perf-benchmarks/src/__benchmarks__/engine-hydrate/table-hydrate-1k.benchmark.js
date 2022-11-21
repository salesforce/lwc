/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent } from '@lwc/engine-server';
import { hydrateComponent } from '@lwc/engine-dom';

import Table from '@lwc/perf-benchmarks-components/dist/server/benchmark/cardComponent/cardComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/server/benchmark/store/store.js';

import TableClient from '@lwc/perf-benchmarks-components/dist/dom/benchmark/cardComponent/cardComponent.js';
import { insertComponent } from '../../utils/utils';

benchmark(`hydrate/table/hydrate/1k`, () => {
    let tableElement;
    let props;

    before(async () => {
        const store = new Store();
        store.run();

        props = {
            title: 'table hydrate 1k',
            rows: store.data,
        };

        const ssrHtml = renderComponent('benchmark-table', Table, props);

        const fragment = new DOMParser().parseFromString(ssrHtml, 'text/html', {
            includeShadowRoots: true,
        });

        tableElement = fragment.querySelector('benchmark-table');

        await insertComponent(tableElement);
    });

    run(() => {
        hydrateComponent(tableElement, TableClient, props);
    });
});
