/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';

import UpdatableComponentListDynamic from '@lwc/perf-benchmarks-components/dist/dom/benchmark/updatableComponentListDynamic/updatableComponentListDynamic.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

const NUMBER_OF_ROWS = 5000;

benchmark(`dom/update/component/dynamic/5k`, () => {
    let elm;
    let store;

    before(async () => {
        elm = createElement('benchmark-updatable-component-list-dynamic', {
            is: UpdatableComponentListDynamic,
        });
        store = new Store();
        store.runWithSize(NUMBER_OF_ROWS); // generate initial random data
        elm.rows = store.data;
        store.runWithSize(NUMBER_OF_ROWS); // generate new random data
        return insertComponent(elm);
    });

    run(() => {
        elm.rows = store.data;
    });

    after(() => {
        destroyComponent(elm);
    });
});
