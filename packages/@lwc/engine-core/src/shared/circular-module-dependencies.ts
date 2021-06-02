/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isFunction, hasOwnProperty } from '@lwc/shared';

interface MaybeModule {
    __esModule?: boolean;
    default?: any;
}

/**
 * When LWC is used in the context of an Aura application, the compiler produces AMD modules, that
 * doesn't resolve properly circular dependencies between modules. In order to circumvent this
 * issue, the module loader returns a factory with a symbol attached to it.
 */

interface CircularModuleDependency<M extends Object> {
    (): M;
    __circular__: boolean;
}

export function resolveCircularModuleDependency<M extends MaybeModule>(
    fn: CircularModuleDependency<M>
): M {
    const module = fn();

    return module?.__esModule ? module.default : module;
}

export function isCircularModuleDependency(obj: unknown): obj is CircularModuleDependency<any> {
    return isFunction(obj) && hasOwnProperty.call(obj, '__circular__');
}
