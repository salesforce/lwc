/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent } from '@lwc/engine-server';
import { hydrateComponent } from '@lwc/engine-dom';

import Table from '@lwc/perf-benchmarks-components/dist/server/benchmark/tableComponent/tableComponent.js';
import TableClient from '@lwc/perf-benchmarks-components/dist/dom/benchmark/tableComponent/tableComponent.js';

import Store from '@lwc/perf-benchmarks-components/dist/server/benchmark/store/store.js';
import { insertComponent } from '../../utils/utils';

benchmark(`hydrate/table-component/hydrate/1k`, () => {
    let props;
    let tableElement;

    before(async () => {
        const store = new Store();
        store.run();

        props = {
            rows: store.data,
        };

        const ssrHtml = renderComponent('benchmark-table', Table, props);

        // parseHTMLUnsafe landed in Chrome 124 https://caniuse.com/mdn-api_document_parsehtmlunsafe_static
        const fragment = Document.parseHTMLUnsafe
            ? Document.parseHTMLUnsafe(ssrHtml)
            : new DOMParser().parseFromString(ssrHtml, 'text/html', {
                  includeShadowRoots: true,
              });

        tableElement = fragment.querySelector('benchmark-table');

        await insertComponent(tableElement);
    });

    run(() => {
        hydrateComponent(tableElement, TableClient, props);
    });
});
