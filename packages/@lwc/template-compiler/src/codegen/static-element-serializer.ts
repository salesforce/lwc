/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlEscape, HTML_NAMESPACE, isVoidElement } from '@lwc/shared';
import { ChildNode, Comment, Element, Literal, Text } from '../shared/types';
import { isElement, isText, isComment } from '../shared/ast';

// Implementation based on the parse5 serializer: https://github.com/inikulin/parse5/blob/master/packages/parse5/lib/serializer/index.ts

// Text nodes child of these tags should not be escaped (https://html.spec.whatwg.org/#serialising-html-fragments).
const rawContentElements = new Set([
    'STYLE',
    'SCRIPT',
    'XMP',
    'IFRAME',
    'NOEMBED',
    'NOFRAMES',
    'PLAINTEXT',
]);

/**
 * Escape all the characters that could break a JavaScript template string literal: "`" (backtick),
 * "${" (dollar + open curly) and "\" (backslash).
 */
function templateStringEscape(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function serializeAttrs(element: Element): string {
    /**
     * 0: styleToken in existing class attr
     * 1: styleToken for added class attr
     * 2: styleToken as attr
     */
    const attrs: string[] = [];
    let hasClassAttr = false;

    const collector = ({ name, value }: { name: string; value: string | boolean }) => {
        let v = typeof value === 'string' ? templateStringEscape(value) : value;

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

    element.attributes
        .map((attr) => {
            return {
                name: attr.name,
                value: (attr.value as Literal).value,
            };
        })
        .forEach(collector);
    // This is tightly coupled with the logic in the parser that decides when an attribute should be
    // a property: https://github.com/salesforce/lwc/blob/master/packages/%40lwc/template-compiler/src/parser/attribute.ts#L198-L218
    // Because a component can't be a static element, we only look in the property bag on value and checked attribute
    // from the input.
    element.properties
        .map((prop) => {
            return {
                name: prop.attributeName,
                value: (prop.value as Literal).value,
            };
        })
        .forEach(collector);

    return (attrs.length > 0 ? ' ' : '') + attrs.join(' ') + (hasClassAttr ? '${2}' : '${3}');
}

function serializeChildren(
    children: ChildNode[],
    parentTagName: string,
    preserveComments: boolean
): string {
    let html = '';

    children.forEach((child) => {
        /* istanbul ignore else  */
        if (isElement(child)) {
            html += serializeStaticElement(child, preserveComments);
        } else if (isText(child)) {
            html += serializeTextNode(child, rawContentElements.has(parentTagName.toUpperCase()));
        } else if (isComment(child)) {
            html += serializeCommentNode(child, preserveComments);
        } else {
            throw new TypeError(
                'Unknown node found while serializing static content. Allowed nodes types are: Element, Text and Comment.'
            );
        }
    });

    return html;
}

function serializeCommentNode(comment: Comment, preserveComment: boolean): string {
    return preserveComment ? `<!--${htmlEscape(templateStringEscape(comment.value))}-->` : '';
}

function serializeTextNode(text: Text, useRawContent: boolean): string {
    let content;
    if (useRawContent) {
        content = text.raw;
    } else {
        content = htmlEscape((text.value as Literal<string>).value);
    }

    return templateStringEscape(content);
}

export function serializeStaticElement(element: Element, preserveComments: boolean): string {
    const { name: tagName, namespace } = element;

    const isForeignElement = namespace !== HTML_NAMESPACE;
    const hasChildren = element.children.length > 0;

    let html = `<${tagName}${serializeAttrs(element)}`;

    if (isForeignElement && !hasChildren) {
        html += '/>';
        return html;
    }

    html += '>';
    html += serializeChildren(element.children, tagName, preserveComments);

    if (!isVoidElement(tagName, namespace) || hasChildren) {
        html += `</${tagName}>`;
    }

    return html;
}
