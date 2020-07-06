/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    createVM,
    connectRootElement,
    getComponentInternalDef,
    setElementProto,
    LightningElement,
} from '@lwc/engine-core';
import { isString, isFunction, isObject, isNull } from '@lwc/shared';

import { renderer } from '../renderer';
import { serializeElement } from '../serializer';

export function renderComponent(
    tagName: string,
    Ctor: typeof LightningElement,
    props: { [name: string]: any } = {}
): string {
    if (!isString(tagName)) {
        throw new TypeError(
            `"renderComponent" expects a string as first parameter but received ${tagName}.`
        );
    }

    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"renderComponent" expects a valid component constructor as second parameter but received ${Ctor}.`
        );
    }

    if (!isObject(props) || isNull(props)) {
        throw new TypeError(
            `"renderComponent" expected an object as third parameter but received ${props}.`
        );
    }

    const element = renderer.createElement(tagName);

    const def = getComponentInternalDef(Ctor);
    setElementProto(element, def);

    createVM(element, def, {
        mode: 'open',
        owner: null,
        renderer,
        tagName,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    connectRootElement(element);

    return serializeElement(element);
}
