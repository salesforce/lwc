/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { AriaAttrNameToPropNameMap, hasOwnProperty } from '@lwc/shared';
import { LightningElement } from './lightning-element';

// Eventually include globals here
const attrsToProps = AriaAttrNameToPropNameMap;

export function reflectAttrToProp(
    instance: LightningElement,
    attrName: string,
    attrValue: string | null
) {
    const reflectedPropName = attrsToProps[attrName];
    // If the reflected property was not overriden by the instance
    if (!hasOwnProperty.call(instance, reflectedPropName)) {
        (instance as any)[reflectedPropName] = attrValue;
    }
}
