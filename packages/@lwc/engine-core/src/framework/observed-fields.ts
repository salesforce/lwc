/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getAssociatedVM } from './vm';
import { componentValueObserved } from './mutation-tracker';
import { updateComponentValue } from './update-component-value';
import type { LightningElement } from './base-lightning-element';

export function createObservedFieldPropertyDescriptor(key: string): PropertyDescriptor {
    return {
        get(this: LightningElement): any {
            const νṁ = getAssociatedVM(this);
            const νɑļ = νṁ.cmpFields[key];
            componentValueObserved(νṁ, key, νɑļ);
            return νɑļ;
        },
        set(this: LightningElement, пėẉVɑļυė: any) {
            const νṁ = getAssociatedVM(this);

            updateComponentValue(νṁ, key, пėẉVɑļυė);
        },
        enumerable: true,
        configurable: true,
    };
}
