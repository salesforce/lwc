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
const inferred = createElement('x-custom-props', { is: CustomProps });
// @api prop is available
inferred.exposedProp satisfies string;
// 👎 this type is incorrect, but that's a limitation of TypeScript
inferred.privateProp satisfies number;
// @ts-expect-error prop doesn't exist on the component
inferred.invalidProp;
// Properties from HTMLElement exist
inferred.childElementCount satisfies number;
// @ts-expect-error Properties from LightningElement do not
inferred.renderedCallback;

// We can provide an empty object as the generic to avoid receiving any custom props (exposed or private)
const object = createElement<object>('x-custom-props', { is: CustomProps });
// @ts-expect-error exposedProp does not exist on `object`
object.exposedProp satisfies string;
// @ts-expect-error private does not exist on `object`
object.privateProp;
// @ts-expect-error prop doesn't exist on `object`
object.invalidProp;
// Properties from HTMLElement exist
object.childElementCount satisfies number;
// @ts-expect-error Properties from LightningElement do not
object.renderedCallback;

// Providing LightningElement to the generic is the same as providing an empty object
const lightningElement = createElement<LightningElement>('x-custom-props', { is: CustomProps });
// @ts-expect-error exposedProp does not exist on LightningElement
lightningElement.exposedProp satisfies string;
// @ts-expect-error private does not exist on LightningElement
lightningElement.privateProp;
// @ts-expect-error prop doesn't exist on LightningElement
lightningElement.invalidProp;
// Properties from HTMLElement exist
lightningElement.childElementCount satisfies number;
// @ts-expect-error Properties from LightningElement do not
lightningElement.renderedCallback;

// Providing exactly the right props works!
const apiPropsOnly = createElement<{ exposedProp: string }>('x-custom-props', { is: CustomProps });
apiPropsOnly.exposedProp satisfies string;
// @ts-expect-error private does not exist on custom type
apiPropsOnly.privateProp;
// @ts-expect-error prop doesn't exist on custom type
apiPropsOnly.invalidProp;
// Properties from HTMLElement exist
apiPropsOnly.childElementCount satisfies number;
// @ts-expect-error Properties from LightningElement do not
apiPropsOnly.renderedCallback;

// @ts-expect-error HTMLElement contains props not defined on CustomProps
createElement<HTMLElement>('x-custom-props', { is: CustomProps });
// @ts-expect-error invalidProp does not exist on CustomProps
createElement<{ invalidProp: boolean }>('x-custom-props', { is: CustomProps });
// @ts-expect-error constructor does not return a string
createElement<string>('x-custom-props', { is: CustomProps });
// @ts-expect-error exposedProp has the wrong type
createElement<{ exposedProp: number }>('x-custom-props', { is: CustomProps });
