/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, defineProperty, getOwnPropertyDescriptor, toString } from '@lwc/shared';
import { componentValueObserved } from '../mutation-tracker';
import { isInvokingRender } from '../invoker';
import { getAssociatedVM } from '../vm';
import { getReactiveProxy } from '../membrane';
import { LightningElement } from '../base-lightning-element';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';
import { updateComponentValue } from '../update-component-value';

import { ClassFieldDecorator } from './types';
import { validateFieldDecoratedWithTrack } from './register';

/**
 * @track decorator function to mark field value as reactive in
 * LWC Components. This function can also be invoked directly
 * with any value to obtain the trackable version of the value.
 */
const track: ClassFieldDecorator = (value, context) => {
    if (context.kind == 'field') {
        const { name } = context;
        return function (this: LightningElement, initialValue) {
            if (process.env.NODE_ENV !== 'production') {
                const vm = getAssociatedVM(this);
                const descriptor = getOwnPropertyDescriptor(vm.def.ctor, name);
                if (descriptor) {
                    validateFieldDecoratedWithTrack(vm.def.ctor, name as string, descriptor);
                }
            }
            defineProperty(this, name, internalTrackDecorator(name as string));
            return initialValue;
        };
    } else throw Error('@track decorator can only be applied to class properties.');
};

export default track;

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
                assert.invariant(
                    !isInvokingRender,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(
                        key
                    )}`
                );
                assert.invariant(
                    !isUpdatingTemplate,
                    `Updating the template of ${vmBeingRendered} has side effects on the state of ${vm}.${toString(
                        key
                    )}`
                );
            }
            const reactiveOrAnyValue = getReactiveProxy(newValue);
            updateComponentValue(vm, key, reactiveOrAnyValue);
        },
        enumerable: true,
        configurable: true,
    };
}
