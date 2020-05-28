/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, freeze, seal } from '@lwc/shared';
import { getCustomElementConstructor, BaseLightningElement } from '../../../src';

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
