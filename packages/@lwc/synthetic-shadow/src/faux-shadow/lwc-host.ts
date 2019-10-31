/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty } from '@lwc/shared';
import { getAttribute, setAttribute } from '../env/element';

/*
 * Using a simple custom attribute is faster based on perf results:
 * Setting attribute: https://jsperf.com/attribute-vs-data-attribute/1
 * matches(selector): https://jsperf.com/matches-attribute-vs-data-attribute/1
 * querySelector(): https://jsperf.com/query-by-attribute-vs-data-attribute/1
 **/
const HostTokenAttributeName = 'lwc:host';

/**
 * Patching HTMLElement.prototype.$lwcHostToken$ to add a custom attribute to host elements
 */
defineProperty(HTMLElement.prototype, '$lwcHostToken$', {
    get(this: HTMLElement): string | null {
        return getAttribute.call(this, HostTokenAttributeName);
    },
    set(this: HTMLElement, value: string) {
        setAttribute.call(this, HostTokenAttributeName, value);
    },
    configurable: true,
});
