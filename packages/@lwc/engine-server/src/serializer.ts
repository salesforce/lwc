/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    APIFeature,
    APIVersion,
    HTML_NAMESPACE,
    htmlEscape,
    isAPIFeatureEnabled,
    isVoidElement,
    validateStyleTextContents,
} from '@lwc/shared';
import { parseFragment } from 'parse5';
import {
    HostAttribute,
    HostAttributesKey,
    HostChildNode,
    HostChildrenKey,
    HostElement,
    HostNamespaceKey,
    HostNodeType,
    HostShadowRoot,
    HostShadowRootKey,
    HostTypeKey,
    HostValueKey,
} from './types';

// Note that for statically optimized content the expression serialization is done in
// buildParseFragmentFn in @lwc/engine-core. It takes the same logic used here.
function serializeAttributes(attributes: HostAttribute[]): string {
    return attributes
        .map((attr) =>
            attr.value.length ? `${attr.name}="${htmlEscape(attr.value, true)}"` : attr.name
        )
        .join(' ');
}

function serializeChildNodes(
    children: HostChildNode[],
    apiVersion: APIVersion,
    tagName?: string
): string {
    return children
        .map((child): string => {
            switch (child[HostTypeKey]) {
                case HostNodeType.Text:
                    return serializeTextContent(child[HostValueKey], apiVersion, tagName);
                case HostNodeType.Comment:
                    return `<!--${htmlEscape(child[HostValueKey])}-->`;
                case HostNodeType.Raw:
                    return child[HostValueKey];
                case HostNodeType.Element:
                    return serializeElement(child, apiVersion);
            }
        })
        .join('');
}

function serializeShadowRoot(shadowRoot: HostShadowRoot, apiVersion: APIVersion): string {
    const attrs = [`shadowrootmode="${shadowRoot.mode}"`];

    if (shadowRoot.delegatesFocus) {
        attrs.push('shadowrootdelegatesfocus');
    }

    return `<template ${attrs.join(' ')}>${serializeChildNodes(
        shadowRoot[HostChildrenKey],
        apiVersion
    )}</template>`;
}

/**
 * Serializes an element into a string
 * @param element The element to serialize
 * @param apiVersion The API version associated with the component for this element
 * @returns A string representation of the element
 */
export function serializeElement(element: HostElement, apiVersion: APIVersion): string {
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
        output += serializeShadowRoot(element[HostShadowRootKey], apiVersion);
    }

    output += serializeChildNodes(element[HostChildrenKey], apiVersion, tagName);

    if (!isVoidElement(tagName, namespace) || hasChildren) {
        output += `</${tagName}>`;
    }

    return output;
}

function serializeTextContent(contents: string, apiVersion: APIVersion, tagName?: string) {
    if (contents === '') {
        return '\u200D'; // Special serialization for empty text nodes
    }
    if (tagName === 'style') {
        // Special validation for <style> tags since their content must be served unescaped, and we need to validate
        // that the contents are safe to serialize unescaped.
        // This only occurs in older API versions; in newer versions; it's handled by the @lwc/style-compiler.
        if (!isAPIFeatureEnabled(APIFeature.VALIDATE_CSS_CONTENT_IN_STYLE_COMPILER, apiVersion)) {
            validateStyleTextContents(contents, parseFragment);
        }
        // If we haven't thrown an error during validation, then the content is safe to serialize unescaped
        return contents;
    }
    return htmlEscape(contents);
}
