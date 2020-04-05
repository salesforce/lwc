/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFunction, isNull, isObject, isUndefined, toString } from '@lwc/shared';
import { createVM, getAssociatedVMIfPresent } from './vm';
import { ComponentConstructor } from './component';
import { EmptyObject, isCircularModuleDependency, resolveCircularModuleDependency } from './utils';
import { getComponentDef, setElementProto } from './def';
import { patchCustomElementWithRestrictions } from './restrictions';
import { registerTagName, isScopedElement } from './local-registry';

type ShadowDomMode = 'open' | 'closed';

interface CreateElementOptions {
    is: ComponentConstructor;
    mode?: ShadowDomMode;
}

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. The intent
 * is to allow the creation of an element controlled by LWC without having
 * to register the element as a custom element. E.g.:
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
    registerTagName(sel);

    // Create element with correct tagName
    const element = document.createElement(sel);
    if (!isUndefined(getAssociatedVMIfPresent(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
    }
    if (!isScopedElement(element)) {
        // Someone else claimed this custom element, most likely a native web component
        return element;
    }

    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

    const def = getComponentDef(Ctor);
    setElementProto(element, def);

    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(element, EmptyObject);
    }
    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(element, def, { mode, owner: null });
    return element;
}
