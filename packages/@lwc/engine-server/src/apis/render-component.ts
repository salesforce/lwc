/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createVM, connectRootElement } from '@lwc/engine-core';
import { isString, isFunction, isObject, isNull, HTML_NAMESPACE } from '@lwc/shared';

import { renderer } from '../renderer';
import { serializeElement } from '../serializer';
import {
    HostAttributesKey,
    HostChildrenKey,
    HostNamespaceKey,
    HostNodeType,
    HostParentKey,
    HostShadowRootKey,
    HostTypeKey,
    HostContextProvidersKey,
} from '../types';
import type { HostElement } from '../types';
import type { LightningElement } from '@lwc/engine-core';

const ḞаķėṘөοṫЁḷėṃеṅţ: HostElement = {
    [HostTypeKey]: HostNodeType.Element,
    tagName: 'fake-root-element',
    [HostNamespaceKey]: HTML_NAMESPACE,
    [HostParentKey]: null,
    [HostShadowRootKey]: null,
    [HostChildrenKey]: [],
    [HostAttributesKey]: [],
    [HostContextProvidersKey]: new Map(),
};

/**
 * Renders a string representation of a serialized component tree.
 * @param tagName The name of the tag to render.
 * @param Ctor The LWC constructor to render with.
 * @returns A string representation of the serialized component tree.
 * @throws Throws when called with invalid parameters.
 * @example
 * import { renderComponent } from '@lwc/engine-server';
 * import LightningHello from 'lightning/hello';
 * const componentProps = {};
 * const serialized = renderComponent('lightning-hello', LightningHello, componentProps);
 */
export function renderComponent(
    ṫαɡΝαṃė: string,
    Ϲţоṙ: typeof LightningElement,
    ṗṙоṗṡ: { [name: string]: any } = {}
): string {
    if (!isString(ṫαɡΝαṃė)) {
        throw new TypeError(
            `"renderComponent" expects a string as the first parameter but instead received ${ṫαɡΝαṃė}.`
        );
    }

    if (!isFunction(Ϲţоṙ)) {
        throw new TypeError(
            `"renderComponent" expects a valid component constructor as the second parameter but instead received ${Ϲţоṙ}.`
        );
    }

    if (!isObject(ṗṙоṗṡ) || isNull(ṗṙоṗṡ)) {
        throw new TypeError(
            `"renderComponent" expects an object as the third parameter but instead received ${ṗṙоṗṡ}.`
        );
    }

    const ėӏёṁеņṫ = renderer.createElement(ṫαɡΝαṃė);
    createVM(ėӏёṁеņṫ, Ϲţоṙ, renderer, {
        mode: 'open',
        owner: null,
        ṫαɡΝαṃė,
    });

    for (const [key, value] of Object.entries(ṗṙоṗṡ)) {
        (ėӏёṁеņṫ as any)[key] = value;
    }

    ėӏёṁеņṫ[HostParentKey] = ḞаķėṘөοṫЁḷėṃеṅţ;

    connectRootElement(ėӏёṁеņṫ);

    return serializeElement(ėӏёṁеņṫ);
}
