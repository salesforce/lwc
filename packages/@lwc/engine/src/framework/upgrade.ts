/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    isNull,
    isObject,
    isFunction,
    isTrue,
    isFalse,
    toString,
} from '../shared/language';
import { createVM, getNodeKey } from './vm';
import { ComponentConstructor } from './component';
import { EmptyObject, isCircularModuleDependency, resolveCircularModuleDependency } from './utils';
import { isNativeShadowRootAvailable } from '../env/dom';
import { patchCustomElementProto } from './patch';
import { getComponentDef, setElementProto } from './def';
import { patchCustomElementWithRestrictions } from './restrictions';

type ShadowDomMode = 'open' | 'closed';

interface CreateElementOptions {
    is: ComponentConstructor;
    fallback?: boolean;
    mode?: ShadowDomMode;
}

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then it throws a TypeError.
 */
export function createElement(sel: string, options: CreateElementOptions): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    let Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects a "is" option with a valid component constructor.`
        );
    }

    const mode = options.mode !== 'closed' ? 'open' : 'closed';
    const fallback =
        isUndefined(options.fallback) ||
        isTrue(options.fallback) ||
        isFalse(isNativeShadowRootAvailable);

    // Create element with correct tagName
    const element = document.createElement(sel);
    if (!isUndefined(getNodeKey(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
    }

    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

    const def = getComponentDef(Ctor);
    setElementProto(element, def);

    if (isTrue(fallback)) {
        patchCustomElementProto(element, {
            def,
        });
    }
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(element, EmptyObject);
    }
    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(element, Ctor, { mode, fallback, isRoot: true, owner: null });
    return element;
}
