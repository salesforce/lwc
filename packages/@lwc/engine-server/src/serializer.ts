/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isVoidElement } from '@lwc/shared';

import { htmlEscape } from './utils/html-escape';
import { HostElement, HostShadowRoot, HostAttribute, HostChildNode, HostNodeType } from './types';

function serializeAttributes(attributes: HostAttribute[]): string {
    return attributes
        .map((attr) =>
            attr.value.length ? `${attr.name}=${JSON.stringify(htmlEscape(attr.value))}` : attr.name
        )
        .join(' ');
}

function serializeChildNodes(children: HostChildNode[]): string {
    return children
        .map((child) => {
            switch (child.type) {
                case HostNodeType.Text:
                    return htmlEscape(child.value);
                case HostNodeType.Comment:
                    return `<!--${htmlEscape(child.value)}-->`;
                case HostNodeType.Element:
                    return serializeElement(child);
            }
        })
        .join('');
}

function serializeShadowRoot(shadowRoot: HostShadowRoot): string {
    const attrs = [`shadowroot="${shadowRoot.mode}"`];

    if (shadowRoot.delegatesFocus) {
        attrs.push('shadowrootdelegatesfocus');
    }

    return `<template ${attrs.join(' ')}>${serializeChildNodes(shadowRoot.children)}</template>`;
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
