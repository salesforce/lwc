/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { HostElement, HostShadowRoot, HostAttribute, HostChildNode, HostNodeType } from './types';

function serializeAttributes(attributes: HostAttribute[]): string {
    return attributes
        .map((attr) =>
            attr.value.length ? `${attr.name}=${JSON.stringify(attr.value)}` : attr.name
        )
        .join(' ');
}

function serializeChildNodes(children: HostChildNode[]): string {
    return children
        .map((child) => {
            switch (child.type) {
                case HostNodeType.Text:
                    return child.value;
                case HostNodeType.Element:
                    return serializeElement(child);
            }
        })
        .join('');
}

function serializeShadowRoot(shadowRoot: HostShadowRoot): string {
    return `<template shadow-root>${serializeChildNodes(shadowRoot.children)}</template>`;
}

export function serializeElement(element: HostElement): string {
    const { name } = element;

    const attrs = element.attributes.length ? ` ${serializeAttributes(element.attributes)}` : '';
    const shadowRoot = element.shadowRoot ? serializeShadowRoot(element.shadowRoot) : '';
    const children = serializeChildNodes(element.children);

    return `<${name}${attrs}>${shadowRoot}${children}</${name}>`;
}
