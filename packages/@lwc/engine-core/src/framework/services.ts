/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, assert, isObject, isUndefined } from '@lwc/shared';

import { ComponentDef } from './def';
import { VM, Context } from './vm';

type ServiceHook = 'connected' | 'disconnected' | 'rendered';

type ServiceCallback = (component: object, data: {}, def: ComponentDef, context: Context) => void;

type ServiceDef = {
    [key in ServiceHook]?: ServiceCallback;
};

export const Services: { readonly [key in ServiceHook]: ServiceCallback[] } = {
    connected: [],
    disconnected: [],
    rendered: [],
};

const hooks: Array<keyof ServiceDef> = ['rendered', 'connected', 'disconnected'];

/**
 * EXPERIMENTAL: This function allows for the registration of "services"
 * in LWC by exposing hooks into the component life-cycle. This API is
 * subject to change or being removed.
 */
export function register(service: ServiceDef) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isObject(service),
            `Invalid service declaration, ${service}: service must be an object`
        );
    }

    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
        const serviceHook = service[hookName];

        if (!isUndefined(serviceHook)) {
            ArrayPush.call(Services[hookName], serviceHook);
        }
    }
}

export function invokeServiceHook(vm: VM, cbs: ServiceCallback[]): void {
    const { component, def, context } = vm;

    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, {}, def, context);
    }
}
