/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api, createElement } from 'lwc';

class CustomProps extends LightningElement {
    @api exposedProp = 'hello';
    privateProp = 123;
}

// By default, all props are available on the returned element (including non-decorated props)
const basic = createElement('x-custom-props', { is: CustomProps });
basic.exposedProp satisfies string;
// This is true, even though we don't want it to be.
basic.privateProp satisfies number;
// @ts-expect-error prop doesn't exist on the component
basic.invalidProp;

// We can provide an explicit generic type; using LightningElement means we don't have anything
const lightningElement = createElement<typeof LightningElement>('x-custom-props', {
    is: CustomProps,
});
// @ts-expect-error exposedProp does not exist on LightningElement
lightningElement.exposedProp;
// @ts-expect-error private does not exist on LightningElement
lightningElement.privateProp;
// @ts-expect-error prop doesn't exist on LightningElement
lightningElement.invalidProp;
