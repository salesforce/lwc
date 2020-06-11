/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isVoidElement } from './utils/elements';

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
    let output = '';
    const { name } = element;

    const attrs = element.attributes.length ? ` ${serializeAttributes(element.attributes)}` : '';
    const children = serializeChildNodes(element.children);

    output += `<${name}${attrs}>`;

    if (element.shadowRoot) {
        output += serializeShadowRoot(element.shadowRoot);
    }

    output += children;

    if (!isVoidElement(name)) {
        output += `</${name}>`;
    }

    return output;
}
