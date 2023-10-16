/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    createVM,
    LightningElement,
    hydrateRoot,
    connectRootElement,
    getAssociatedVMIfPresent,
} from '@lwc/engine-core';
import { StringToLowerCase, isFunction, isNull, isObject } from '@lwc/shared';
import { renderer } from '../renderer';

function resetShadowRootAndLightDom(element: Element, Ctor: typeof LightningElement) {
    if (element.shadowRoot) {
        const shadowRoot = element.shadowRoot;

        while (!isNull(shadowRoot.firstChild)) {
            shadowRoot.removeChild(shadowRoot.firstChild);
        }
    }

    if (Ctor.renderMode === 'light') {
        while (!isNull(element.firstChild)) {
            element.removeChild(element.firstChild);
        }
    }
}

function createVMWithProps(element: Element, Ctor: typeof LightningElement, props: object) {
    const vm = createVM(element, Ctor, renderer, {
        mode: 'open',
        owner: null,
        tagName: element.tagName.toLowerCase(),
        hydrated: true,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    return vm;
}

export function hydrateComponent(
    element: Element,
    Ctor: typeof LightningElement,
    props: { [name: string]: any } = {}
) {
    if (!(element instanceof Element)) {
        throw new TypeError(
            `"hydrateComponent" expects a valid DOM element as the first parameter but instead received ${element}.`
        );
    }

    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"hydrateComponent" expects a valid component constructor as the second parameter but instead received ${Ctor}.`
        );
    }

    if (!isObject(props) || isNull(props)) {
        throw new TypeError(
            `"hydrateComponent" expects an object as the third parameter but instead received ${props}.`
        );
    }

    if (getAssociatedVMIfPresent(element)) {
        /* eslint-disable-next-line no-console */
        console.warn(`"hydrateComponent" expects an element that is not hydrated.`, element);
        return;
    }

    try {
        const { defineCustomElement, getTagName } = renderer;
        defineCustomElement(StringToLowerCase.call(getTagName(element)));
        const vm = createVMWithProps(element, Ctor, props);

        hydrateRoot(vm);
    } catch (e) {
        // Fallback: In case there's an error while hydrating, let's log the error, and replace the element content
        //           with the client generated DOM.

        /* eslint-disable-next-line no-console */
        console.error('Recovering from error while hydrating: ', e);

        // We want to preserve the element, so we need to reset the shadowRoot and light dom.
        resetShadowRootAndLightDom(element, Ctor);

        // we need to recreate the vm with the hydration flag on, so it re-uses the existing shadowRoot.
        createVMWithProps(element, Ctor, props);

        connectRootElement(element);
    }
}
