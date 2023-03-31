/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createVM, connectRootElement, LightningElement } from '@lwc/engine-core';
import { isString, isFunction, isObject, isNull, HTML_NAMESPACE } from '@lwc/shared';

import { renderer } from '../renderer';
import { serializeElement } from '../serializer';
import {
    HostAttributesKey,
    HostChildrenKey,
    HostElement,
    HostNamespaceKey,
    HostNodeType,
    HostParentKey,
    HostShadowRootKey,
    HostTypeKey,
    HostContextProvidersKey,
} from '../types';

const FakeRootElement: HostElement = {
    [HostTypeKey]: HostNodeType.Element,
    tagName: 'fake-root-element',
    [HostNamespaceKey]: HTML_NAMESPACE,
    [HostParentKey]: null,
    [HostShadowRootKey]: null,
    [HostChildrenKey]: [],
    [HostAttributesKey]: [],
    [HostContextProvidersKey]: new Map(),
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

    const element = renderer.createElement(tagName);
    createVM(element, Ctor, renderer, {
        mode: 'open',
        owner: null,
        tagName,
    });

    for (const [key, value] of Object.entries(props)) {
        (element as any)[key] = value;
    }

    element[HostParentKey] = FakeRootElement;

    connectRootElement(element);

    return serializeElement(element);
}
