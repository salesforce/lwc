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

function serializeChildNodes(children: HostChildNode[], options: { [name: string]: any }): string {
    return children
        .map((child) => {
            switch (child.type) {
                case HostNodeType.Text:
                    return htmlEscape(child.value);
                case HostNodeType.Element:
                    return serializeElement(child, options);
            }
        })
        .join('');
}

function serializeShadowRoot(shadowRoot: HostShadowRoot, options: { [name: string]: any }): string {
    const lightDom = options.syntheticShadow;
    if (lightDom) {
        return serializeChildNodes(shadowRoot.children, options);
    } else {
        const attrs = [`shadowroot="${shadowRoot.mode}"`];

        if (shadowRoot.delegatesFocus) {
            attrs.push('shadowrootdelegatesfocus');
        }

        return `<template ${attrs.join(' ')}>${serializeChildNodes(
            shadowRoot.children,
            options
        )}</template>`;
    }
}

export function serializeElement(element: HostElement, options: { [name: string]: any }): string {
    let output = '';
    const { name } = element;

    let attrs = element.attributes.length ? ` ${serializeAttributes(element.attributes)}` : '';

    // Shadow dom token
    const lightDom = options.syntheticShadow;
    if (lightDom) {
        const tk = (element as any)['$shadowToken$'];
        if (tk) {
            attrs += ' ' + tk;
        }
    }

    const children = serializeChildNodes(element.children, options);

    output += `<${name}${attrs}>`;

    if (element.shadowRoot) {
        output += serializeShadowRoot(element.shadowRoot, options);
    }

    output += children;

    if (!isVoidElement(name)) {
        output += `</${name}>`;
    }

    return output;
}
