/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getAssociatedVMIfPresent, LightningElement } from '@lwc/engine-core';
import { isUndefined, keys } from '@lwc/shared';

/**
 * Displays the header for a custom element.
 *
 * @param ce the custom element
 * @param componentInstance component instance associated with the custom element.
 */
function getHeaderForCustomElement(ce: HTMLElement, componentInstance: LightningElement) {
    // [element]
    // LWC component instance: [vm.component]
    return [
        'div',
        {},
        ['object', { object: ce, config: { skip: true } }],
        [
            'div',
            {},
            ['span', { style: 'margin: 0 5px; color: red' }, 'LWC:'],
            ['object', { object: componentInstance }],
        ],
    ];
}

function getHeaderForComponentInstance(
    componentInstance: LightningElement,
    debugInfo: Record<symbol, any>
) {
    if (keys(debugInfo).length === 0) {
        // there is no debug information, no need to customize this component instance
        return null;
    }

    // [component]
    // Debug information: [vm.debugInfo]
    return [
        'div',
        {},
        ['object', { object: componentInstance, config: { skip: true } }],
        [
            'div',
            {},
            ['span', { style: 'margin: 0 5px; color: red' }, 'Debug:'],
            ['object', { object: debugInfo }],
        ],
    ];
}

export const LightningElementFormatter = {
    name: 'LightningElementFormatter',

    header(obj: any, config?: Record<string, any>) {
        const vm = getAssociatedVMIfPresent(obj);

        if (!isUndefined(vm) && (isUndefined(config) || !config.skip)) {
            if (obj instanceof HTMLElement) {
                return getHeaderForCustomElement(obj, vm.component);
            } else {
                return getHeaderForComponentInstance(obj, vm.debugInfo!);
            }
        }

        return null;
    },
    hasBody() {
        return false;
    },
};
