/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { htmlEscape, HTML_NAMESPACE, isVoidElement } from '@lwc/shared';

import {
    HostElement,
    HostShadowRoot,
    HostAttribute,
    HostChildNode,
    HostNodeType,
    HostTypeKey,
    HostNamespaceKey,
    HostShadowRootKey,
    HostAttributesKey,
    HostChildrenKey,
    HostValueKey,
} from './types';
import { validateStyleTextContents } from './utils/validate-style-text-contents';

function serializeAttributes(attributes: HostAttribute[]): string {
    return attributes
        .map((attr) =>
            attr.value.length ? `${attr.name}="${htmlEscape(attr.value, true)}"` : attr.name
        )
        .join(' ');
}

function serializeChildNodes(children: HostChildNode[], tagName?: string): string {
    return children
        .map((child): string => {
            switch (child[HostTypeKey]) {
                case HostNodeType.Text:
                    return serializeTextContent(child[HostValueKey], tagName);
                case HostNodeType.Comment:
                    return `<!--${htmlEscape(child[HostValueKey])}-->`;
                case HostNodeType.Raw:
                    return child[HostValueKey];
                case HostNodeType.Element:
                    return serializeElement(child);
            }
        })
        .join('');
}

function serializeShadowRoot(shadowRoot: HostShadowRoot): string {
    const attrs = [`shadowrootmode="${shadowRoot.mode}"`];

    if (shadowRoot.delegatesFocus) {
        attrs.push('shadowrootdelegatesfocus');
    }

    return `<template ${attrs.join(' ')}>${serializeChildNodes(
        shadowRoot[HostChildrenKey]
    )}</template>`;
}

export function serializeElement(element: HostElement): string {
    let output = '';

    const tagName = element.tagName;
    const namespace = element[HostNamespaceKey];
    const isForeignElement = namespace !== HTML_NAMESPACE;
    const hasChildren = element[HostChildrenKey].length > 0;

    const attrs = element[HostAttributesKey].length
        ? ` ${serializeAttributes(element[HostAttributesKey])}`
        : '';

    output += `<${tagName}${attrs}`;

    // Note that foreign elements can have children but not shadow roots
    if (isForeignElement && !hasChildren) {
        output += '/>';
        return output;
    }

    output += '>';

    if (element[HostShadowRootKey]) {
        output += serializeShadowRoot(element[HostShadowRootKey]);
    }

    output += serializeChildNodes(element[HostChildrenKey], tagName);

    if (!isVoidElement(tagName, namespace) || hasChildren) {
        output += `</${tagName}>`;
    }

    return output;
}

function serializeTextContent(contents: string, tagName?: string) {
    if (contents === '') {
        return '\u200D'; // Special serialization for empty text nodes
    }
    if (tagName === 'style') {
        // Special validation for <style> tags since their content must be served unescaped, and we need to validate
        // that the contents are safe to serialize unescaped.
        // TODO [#3454]: move this validation to compilation
        validateStyleTextContents(contents);
        // If we haven't thrown an error during validation, then the content is safe to serialize unescaped
        return contents;
    }
    return htmlEscape(contents);
}
