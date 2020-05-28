/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, freeze, isUndefined, seal } from '@lwc/shared';

import {
    BaseLightningElement,
    buildCustomElementConstructor,
    ComponentConstructor,
    HTMLElementConstructor,
} from '../../../src';

const ComponentConstructorToCustomElementConstructorMap = new Map<
    ComponentConstructor,
    HTMLElementConstructor
>();

function getCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    if (Ctor === BaseLightningElement) {
        throw new TypeError(
            `Invalid Constructor. LightningElement base class can't be claimed as a custom element.`
        );
    }
    let ce = ComponentConstructorToCustomElementConstructorMap.get(Ctor);
    if (isUndefined(ce)) {
        ce = buildCustomElementConstructor(Ctor);
        ComponentConstructorToCustomElementConstructorMap.set(Ctor, ce);
    }
    return ce;
}

/**
 * This static getter builds a Web Component class from a LWC constructor
 * so it can be registered as a new element via customElements.define()
 * at any given time. E.g.:
 *
 *      import Foo from 'ns/foo';
 *      customElements.define('x-foo', Foo.CustomElementConstructor);
 *      const elm = document.createElement('x-foo');
 *
 */
defineProperty(BaseLightningElement, 'CustomElementConstructor', {
    get() {
        return getCustomElementConstructor(this);
    },
});

freeze(BaseLightningElement);
seal(BaseLightningElement.prototype);

export { BaseLightningElement };
