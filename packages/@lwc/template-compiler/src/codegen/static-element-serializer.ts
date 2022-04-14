/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlEscape, isVoidElement } from '@lwc/shared';
import { Attribute, ChildNode, Element, Literal, Property } from '../shared/types';
import { isElement, isText, isComment } from '../shared/ast';

const rawContentElements = new Set([
    'STYLE',
    'SCRIPT',
    'XMP',
    'IFRAME',
    'NOEMBED',
    'NOFRAMES',
    'PLAINTEXT',
    'NOSCRIPT',
]);

function serializeAttrs(element: Element): string {
    /**
     * 0: styleToken in existing class attr
     * 1: styleToken for added class attr
     * 2: styleToken as attr
     */
    const attrs: string[] = [];
    let hasClassAttr = false;

    const collector = ({ name, value }: Attribute | Property) => {
        let v = (value as Literal).value;

        if (name === 'class') {
            hasClassAttr = true;
            v += '${0}';
        }
        if (typeof v === 'string') {
            attrs.push(`${name}="${htmlEscape(v, true)}"`);
        } else {
            attrs.push(name);
        }
    };

    element.attributes.forEach(collector);
    element.properties.forEach(collector);

    return (attrs.length > 0 ? ' ' : '') + attrs.join(' ') + (hasClassAttr ? '${2}' : '${1}${2}');
}

function serializeChildren(children: ChildNode[], parentTagName: string): string {
    let html = '';

    children.forEach((child) => {
        if (isElement(child)) {
            html += serializeStaticElement(child);
        } else if (isText(child)) {
            if (rawContentElements.has(parentTagName.toUpperCase())) {
                html += child.raw;
            } else {
                html += htmlEscape((child.value as Literal<string>).value);
            }
        } else if (isComment(child)) {
            html += `<!--${htmlEscape(child.value)}-->`;
        } else {
            throw new TypeError(
                'Unknown node found while serializing static content. Allowed nodes types are: Element, Text and Comment.'
            );
        }
    });

    return html;
}

export function serializeStaticElement(element: Element): string {
    const tagName = element.name;

    let html = '<' + tagName + serializeAttrs(element) + '>';

    html += serializeChildren(element.children, tagName);

    // element.children.length > 0 can happen in the SVG namespace.
    if (!isVoidElement(tagName) || element.children.length > 0) {
        html += `</${tagName}>`;
    }

    return html;
}
