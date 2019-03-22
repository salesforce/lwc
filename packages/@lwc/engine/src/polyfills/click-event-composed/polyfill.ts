/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { addEventListener, removeEventListener } from '../../env/element';

const originalClickDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'click');

function handleClick(event) {
    Object.defineProperty(event, 'composed', {
        configurable: true,
        enumerable: true,
        get() {
            return true;
        },
    });
}

export default function apply() {
    HTMLElement.prototype.click = function() {
        addEventListener.call(this, 'click', handleClick);
        try {
            originalClickDescriptor!.value!.call(this);
        } finally {
            removeEventListener.call(this, 'click', handleClick);
        }
    };
}
