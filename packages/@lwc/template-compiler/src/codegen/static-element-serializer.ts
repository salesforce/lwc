/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlEscape, HTML_NAMESPACE, isVoidElement } from '@lwc/shared';
import { Comment, Element, Literal, StaticElement, Text } from '../shared/types';
import { isElement, isComment, isExpression, isText } from '../shared/ast';
import { transformStaticChildren, isDynamicText } from './static-element';
import type CodeGen from './codegen';

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
 * @param str
 */
function templateStringEscape(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function serializeAttrs(element: Element, codeGen: CodeGen): string {
    /**
     * 0: styleToken in existing class attr
     * 1: styleToken for added class attr
     * 2: styleToken as attr
     */
    const attrs: string[] = [];
    let hasClassAttr = false;

    const collector = ({
        name,
        value,
        hasExpression,
    }: {
        name: string;
        value: string | boolean;
        hasExpression?: boolean;
    }) => {
        let v = typeof value === 'string' ? templateStringEscape(value) : value;

        if (name === 'class') {
            hasClassAttr = true;
            // ${0} maps to class token that will be appended to the string.
            // See buildParseFragmentFn for details.
            // The token is only needed when the class attribute is static.
            // The token will be injected at runtime for expressions in parseFragmentFn.
            if (!hasExpression) {
                v += '${0}';
            }
        }
        if (typeof v === 'string') {
            // Inject a placeholder where the staticPartId will go when an expression occurs.
            // This is only needed for SSR to inject the expression value during serialization.
            attrs.push(hasExpression ? `\${"${v}"}` : ` ${name}="${htmlEscape(v, true)}"`);
        } else {
            attrs.push(` ${name}`);
        }
    };

    element.attributes
        .map((attr) => {
            const hasExpression = isExpression(attr.value);
            return {
                hasExpression,
                name: attr.name,
                value: hasExpression
                    ? codeGen.getStaticExpressionToken(attr)
                    : (attr.value as Literal).value,
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

    // ${2} maps to style token attribute
    // ${3} maps to class attribute token + style token attribute
    // See buildParseFragmentFn for details.
    return attrs.join('') + (hasClassAttr ? '${2}' : '${3}');
}

function serializeChildren(node: StaticElement, parentTagName: string, codeGen: CodeGen): string {
    let html = '';

    for (const child of transformStaticChildren(node)) {
        /* istanbul ignore else  */
        if (isDynamicText(child)) {
            html += serializeDynamicTextNode(child, codeGen);
        } else if (isText(child)) {
            html += serializeStaticTextNode(
                child,
                rawContentElements.has(parentTagName.toUpperCase())
            );
        } else if (isElement(child)) {
            html += serializeStaticElement(child, codeGen);
        } else if (isComment(child)) {
            html += serializeCommentNode(child, codeGen.preserveComments);
        } else {
            throw new TypeError(
                'Unknown node found while serializing static content. Allowed nodes types are: Element, Text and Comment.'
            );
        }
    }

    return html;
}

function serializeCommentNode(comment: Comment, preserveComment: boolean): string {
    return preserveComment ? `<!--${htmlEscape(templateStringEscape(comment.value))}-->` : '';
}

function serializeDynamicTextNode(textNodes: Text[], codeGen: CodeGen) {
    // The first text node is they key for contiguous text nodes and single expressions.
    // This is guaranteed to have a value by the isDynamicText check.
    return `\${"${codeGen.getStaticExpressionToken(textNodes[0])}"}`;
}

function serializeStaticTextNode(text: Text, useRawContent: boolean): string {
    let content;
    if (useRawContent) {
        content = text.raw;
    } else {
        content = htmlEscape((text.value as Literal<string>).value);
    }

    content = templateStringEscape(content);

    return content;
}

export function serializeStaticElement(element: StaticElement, codeGen: CodeGen): string {
    const { name: tagName, namespace } = element;

    const isForeignElement = namespace !== HTML_NAMESPACE;
    const hasChildren = element.children.length > 0;

    let html = `<${tagName}${serializeAttrs(element, codeGen)}`;

    if (isForeignElement && !hasChildren) {
        html += '/>';
        return html;
    }

    html += '>';
    html += serializeChildren(element, tagName, codeGen);

    if (!isVoidElement(tagName, namespace) || hasChildren) {
        html += `</${tagName}>`;
    }

    return html;
}
