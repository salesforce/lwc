/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, getOwnPropertyDescriptor } from '@lwc/shared';
import { addEventListener, removeEventListener } from '../../env/event-target';

const originalClickDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'click');

function handleClick(event: Event) {
    defineProperty(event, 'composed', {
        configurable: true,
        enumerable: true,
        get() {
            return true;
        },
    });
}

export default function apply() {
    HTMLElement.prototype.click = function () {
        addEventListener.call(this, 'click', handleClick);
        try {
            originalClickDescriptor!.value!.call(this);
        } finally {
            removeEventListener.call(this, 'click', handleClick);
        }
    };
}
