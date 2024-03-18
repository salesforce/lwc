/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from '@lwc/engine-dom';
import JsFrameworkBenchmarkTable from '@lwc/perf-benchmarks-components/dist/dom/benchmark/jsFrameworkBenchmarkTable/jsFrameworkBenchmarkTable.js';
import { destroyComponent, insertComponent } from './utils.js';

const actionsToElementIds = {
    run: '#run',
    runLots: '#runlots',
    add: '#add',
    update: '#update',
    clear: '#clear',
    swapRows: '#swaprows',
};

export const WARMUP_COUNT = 5;

// This is an abstraction of the various operations that js-framework-benchmark does.
// Most of these revolve around clicking an element with a given id (#run, #runlots, etc.), but sometimes
// it involves clicking a particular element inside a row (e.g. to remove the row or select it).
export function runJsFrameworkBenchmark(
    name,
    { benchmark, before, run, after },
    { warmup, execute }
) {
    benchmark(name, () => {
        let elm;
        let controller;

        before(async () => {
            elm = createElement('benchmark-js-framework-benchmark-table', {
                is: JsFrameworkBenchmarkTable,
            });
            await insertComponent(elm);

            controller = {
                // actions that only require clicking a given element ID
                ...Object.fromEntries(
                    Object.entries(actionsToElementIds).map(([action, id]) => {
                        return [
                            action,
                            async () => {
                                elm.querySelector(id).click();
                                await Promise.resolve(); // wait for LWC to render
                            },
                        ];
                    })
                ),
                // actions that require clicking inside a particular row
                select: async (rowToClick) => {
                    elm.querySelector(
                        `tbody>tr:nth-of-type(${rowToClick})>td:nth-of-type(2)>a`
                    ).click();
                    await Promise.resolve(); // wait for LWC to render
                },
                remove: async (rowToClick) => {
                    elm.querySelector(
                        `tbody>tr:nth-of-type(${rowToClick})>td:nth-of-type(3)>a>span:nth-of-type(1)`
                    ).click();
                    await Promise.resolve(); // wait for LWC to render
                },
            };

            await warmup(controller);
        });

        run(async () => {
            await execute(controller);
        });

        after(() => {
            destroyComponent(elm);
        });
    });
}
