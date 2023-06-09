/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import '@lwc/synthetic-shadow';
import { createElement } from '@lwc/engine-dom';

import TableComponent from '@lwc/perf-benchmarks-components/dist/dom/benchmark/tableComponent/tableComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

benchmark(`dom/synthetic-shadow/mutation-observer/10k`, () => {
    let tableElement;
    let tableRows;
    let store;

    before(async () => {
        tableElement = createElement('benchmark-table-component', { is: TableComponent });
        store = new Store();
        store.run();
        tableElement.rows = store.data;
        await insertComponent(tableElement);
        tableRows = [...tableElement.shadowRoot.querySelectorAll('benchmark-table-component-row')];
    });

    run(async () => {
        // observe at multiple levels, including where we shouldn't be allowed to see inside the shadow root
        for (const rowElement of tableRows) {
            new MutationObserver(() => {}).observe(tableElement, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true,
            });
            new MutationObserver(() => {}).observe(rowElement, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true,
            });
            new MutationObserver(() => {}).observe(rowElement.shadowRoot, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true,
            });
        }

        // trigger mutations - mutations, deletions, insertions
        for (const rowElement of tableRows) {
            for (const child of rowElement.shadowRoot.children) {
                child.nodeValue += ' update';
            }
            rowElement.shadowRoot.lastChild.remove();
            rowElement.shadowRoot.appendChild(document.createElement('div'));
        }
    });

    after(() => {
        destroyComponent(tableElement);
    });
});
