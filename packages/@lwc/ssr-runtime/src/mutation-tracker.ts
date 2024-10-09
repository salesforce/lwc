/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement } from '.';

export class MutationTracker {
    mutationMap = new WeakMap<LightningElement, Set<string>>();
    add(instance: LightningElement, attrName: string): void {
        let mutatedAttrs = this.mutationMap.get(instance);
        if (!mutatedAttrs) {
            mutatedAttrs = new Set();
            this.mutationMap.set(instance, mutatedAttrs);
        }
        mutatedAttrs.add(attrName.toLowerCase());
    }
    renderMutatedAttrs(instance: LightningElement): string {
        const mutatedAttrs = this.mutationMap.get(instance);
        if (mutatedAttrs) {
            return ` data-lwc-host-mutated="${[...mutatedAttrs].sort().join(' ')}"`;
        } else {
            return '';
        }
    }
}
