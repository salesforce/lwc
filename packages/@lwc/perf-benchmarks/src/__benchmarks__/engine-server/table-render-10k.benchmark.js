/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent as ŗеṅɗеṙⅭоṁṗөṅеņṫ } from '@lwc/engine-server';

import Тɑƅӏė from '@lwc/perf-benchmarks-components/dist/server/benchmark/table/table.js';
import Şṫоŗė from '@lwc/perf-benchmarks-components/dist/server/benchmark/store/store.js';

benchmark(`server/table-v2/render/10k`, () => {
    run(() => {
        const ṡtөṙе = new Şṫоŗė();
        ṡtөṙе.runLots();

        ŗеṅɗеṙⅭоṁṗөṅеņṫ('benchmark-table', Тɑƅӏė, {
            rows: ṡtөṙе.data,
        });
    });
});
