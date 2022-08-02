/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse, isTrue } from '@lwc/shared';

import { JobFunction, ReactiveObserver } from '../libs/mutation-tracker';
import { rerenderVM, VM } from './vm';
import { addCallbackToNextTick } from './utils';

const DUMMY_ACCESSOR_REACTIVE_OBSERVER = {
    observe(job: JobFunction) {
        job();
    },
    reset() {},
    link() {},
} as unknown as AccessorReactiveObserver;

export class AccessorReactiveObserver extends ReactiveObserver {
    private value: any;
    private debouncing: boolean = false;
    constructor(vm: VM, set: (v: any) => void) {
        super(() => {
            if (isFalse(this.debouncing)) {
                this.debouncing = true;
                addCallbackToNextTick(() => {
                    if (isTrue(this.debouncing)) {
                        const { value } = this;
                        const { isDirty: dirtyStateBeforeSetterCall, component, idx } = vm;
                        set.call(component, value);
                        // de-bouncing after the call to the original setter to prevent
                        // infinity loop if the setter itself is mutating things that
                        // were accessed during the previous invocation.
                        this.debouncing = false;
                        if (isTrue(vm.isDirty) && isFalse(dirtyStateBeforeSetterCall) && idx > 0) {
                            // immediate rehydration due to a setter driven mutation, otherwise
                            // the component will get rendered on the second tick, which it is not
                            // desirable.
                            rerenderVM(vm);
                        }
                    }
                });
            }
        });
    }
    reset(value?: any) {
        super.reset();
        this.debouncing = false;
        if (arguments.length > 0) {
            this.value = value;
        }
    }
}

export function createAccessorReactiveObserver(
    vm: VM,
    set: (v: any) => void
): AccessorReactiveObserver {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER
        ? new AccessorReactiveObserver(vm, set)
        : DUMMY_ACCESSOR_REACTIVE_OBSERVER;
}
