/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, toString } from '@lwc/shared';
import { componentValueObserved } from '../mutation-tracker';
import { isInvokingRender } from '../invoker';
import { getAssociatedVM } from '../vm';
import { getReactiveProxy } from '../membrane';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';
import { updateComponentValue } from '../update-component-value';
import { logError } from '../../shared/logger';
import type { LightningElement } from '../base-lightning-element';

/**
 * The `@track` decorator function marks field values as reactive in
 * LWC Components. This function can also be invoked directly
 * with any value to obtain the trackable version of the value.
 */
export default function track(target: undefined, context: ClassFieldDecoratorContext): void;
export default function track<T>(target: T, context?: never): T;
export default function track(
    target: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: ClassFieldDecoratorContext
): unknown {
    if (arguments.length === 1) {
        return getReactiveProxy(target);
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.fail(
            `@track decorator can only be used with one argument to return a trackable object, or as a decorator function.`
        );
    }
    throw new Error();
}

export function internalTrackDecorator(key: string): PropertyDescriptor {
    return {
        get(this: LightningElement): any {
            const vm = getAssociatedVM(this);
            const val = vm.cmpFields[key];
            componentValueObserved(vm, key, val);
            return val;
        },
        set(this: LightningElement, newValue: any) {
            const vm = getAssociatedVM(this);
            if (process.env.NODE_ENV !== 'production') {
                const vmBeingRendered = getVMBeingRendered();
                if (isInvokingRender) {
                    logError(
                        `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(
                            key
                        )}`
                    );
                }
                if (isUpdatingTemplate) {
                    logError(
                        `Updating the template of ${vmBeingRendered} has side effects on the state of ${vm}.${toString(
                            key
                        )}`
                    );
                }
            }
            const reactiveOrAnyValue = getReactiveProxy(newValue);
            updateComponentValue(vm, key, reactiveOrAnyValue);
        },
        enumerable: true,
        configurable: true,
    };
}
