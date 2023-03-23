/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, toString } from '@lwc/shared';
import { componentValueObserved } from '../mutation-tracker';
import { isInvokingRender } from '../invoker';
import { getAssociatedVM } from '../vm';
import { getReactiveProxy } from '../membrane';
import { LightningElement } from '../base-lightning-element';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';
import { updateComponentValue } from '../update-component-value';
import { logError } from '../../shared/logger';

/**
 * @track decorator function to mark field value as reactive in
 * LWC Components. This function can also be invoked directly
 * with any value to obtain the trackable version of the value.
 */
export default function track(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
): any;
export default function track(target: any): any {
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
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
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
