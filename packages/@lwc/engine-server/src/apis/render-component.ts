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
    LightningElement,
} from '@lwc/engine-core';
import { isString, isFunction, isObject, isNull } from '@lwc/shared';

import { SsrRenderer } from '../renderer';
import { serializeElement } from '../serializer';
import { HostElement, HostNodeType } from '../types';

const FakeRootElement: HostElement = {
    type: HostNodeType.Element,
    name: 'fake-root-element',
    namespace: 'ssr',
    parent: null,
    shadowRoot: null,
    children: [],
    attributes: [],
    eventListeners: {},
};

export function renderComponent(
    tagName: string,
    Ctor: typeof LightningElement,
    props: { [name: string]: any } = {},
    options: { syntheticShadow?: boolean } = {},
): {html: string, styles: string[]} {
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

    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"renderComponent" expects an object as the fourth parameter but instead received ${options}.`
        );
    }

    const renderer = new SsrRenderer(options)
    const element = renderer.createElement(tagName);

    const def = getComponentInternalDef(Ctor);

    createVM(element, def, {
        mode: 'open',
        owner: null,
        renderer,
        tagName,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    element.parent = FakeRootElement;

    connectRootElement(element);

    const html = serializeElement(element,options);

    const styles = Array.from(renderer.globalStylesheets);
    return {
        html,
        styles
    }
}
