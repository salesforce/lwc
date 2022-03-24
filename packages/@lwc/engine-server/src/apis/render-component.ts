/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createVM, connectRootElement, LightningElement } from '@lwc/engine-core';
import type { RendererAPI } from '@lwc/engine-core/types/renderer';
import { isString, isFunction, isObject, isNull } from '@lwc/shared';

import * as renderer from '../renderer';
import { createElement } from '../renderer';
import { serializeElement } from '../serializer';
import { HostElement, HostNodeType } from '../types';

const FakeRootElement: HostElement = {
    type: HostNodeType.Element,
    name: 'fake-root-element',
    parent: null,
    shadowRoot: null,
    children: [],
    attributes: [],
    eventListeners: {},
};

export function renderComponent(
    tagName: string,
    Ctor: typeof LightningElement,
    props: { [name: string]: any } = {}
): string {
    if (!isString(tagName)) {
        throw new TypeError(
            `"renderComponent" expects a string as the first parameter but instead received ${tagName}.`
        );
    }

    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"renderComponent" expects a valid component constructor as the second parameter but instead received ${Ctor}.`
        );
    }

    if (!isObject(props) || isNull(props)) {
        throw new TypeError(
            `"renderComponent" expects an object as the third parameter but instead received ${props}.`
        );
    }

    const element = createElement(tagName);
    createVM(element, Ctor, renderer as unknown as RendererAPI, {
        mode: 'open',
        owner: null,
        tagName,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    element.parent = FakeRootElement;

    connectRootElement(element);

    return serializeElement(element);
}
