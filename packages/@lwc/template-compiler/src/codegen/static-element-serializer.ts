/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { HTML_NAMESPACE, htmlEscape, isVoidElement, normalizeStyleAttribute } from '@lwc/shared';
import {
    isAllowedFragOnlyUrlsXHTML,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';
import { Comment, Element, Literal, StaticChildNode, StaticElement, Text } from '../shared/types';
import {
    isBooleanLiteral,
    isComment,
    isElement,
    isExpression,
    isStringLiteral,
    isText,
} from '../shared/ast';
import { hasDynamicText, isContiguousText, transformStaticChildren } from './static-element';
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

function normalizeWhitespace(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
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
        hasSvgUseHref,
        needsScoping,
    }: {
        name: string;
        value: string | boolean;
        hasExpression?: boolean;
        hasSvgUseHref?: boolean;
        needsScoping?: boolean;
    }) => {
        // Do not serialize boolean class/style attribute (consistent with non-static optimized)
        if (typeof value === 'boolean' && (name === 'class' || name === 'style')) {
            return;
        }

        // See W-16614169
        const escapedAttributeName = templateStringEscape(name);

        if (typeof value === 'string') {
            let v = templateStringEscape(value);

            if (name === 'class') {
                // ${0} maps to class token that will be appended to the string.
                // See buildParseFragmentFn for details.
                // The token is only needed when the class attribute is static.
                // The token will be injected at runtime for expressions in parseFragmentFn.
                if (!hasExpression) {
                    v = normalizeWhitespace(v);
                    if (v === '') {
                        // Do not serialize empty class attribute (consistent with non-static optimized)
                        return;
                    }
                    v += '${0}';
                }
                hasClassAttr = true;
            }

            // `spellcheck` string values are specially handled to massage them into booleans.
            // For backwards compat with non-static-optimized templates, we also treat any non-`"false"`
            // value other than the valueless format (e.g. `<div spellcheck>`) as `"true"`,
            // even though per MDN, the empty string and `"true"` are equivalent:
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck
            if (name === 'spellcheck' && !hasExpression) {
                v = String(v.toLowerCase() !== 'false');
            }

            if (name === 'style' && !hasExpression) {
                v = normalizeStyleAttribute(v);
                if (v === '') {
                    // Do not serialize empty style attribute (consistent with non-static optimized)
                    return;
                }
            }

            // IDs/IDRefs must be handled dynamically at runtime due to synthetic shadow scoping.
            // Skip serializing here and handle it as if it were a dynamic attribute instead.
            // Note that, to maintain backwards compatibility with the non-static output, we treat the valueless
            // "boolean" format (e.g. `<div id>`) as the empty string, which is semantically equivalent.
            const needsPlaceholder = hasExpression || hasSvgUseHref || needsScoping;

            let nameAndValue;
            if (needsPlaceholder) {
                // Inject a placeholder where the staticPartId will go when an expression occurs.
                // This is only needed for SSR to inject the expression value during serialization.
                nameAndValue = `\${"${v}"}`;
            } else if (v === '') {
                // In HTML, there is no difference between the empty string value (`<div foo="">`) and "boolean true"
                // (`<div foo>`). They are both parsed identically, and the DOM treats them the same (`getAttribute`
                // returns the empty string). Here we prefer the shorter format.
                // https://html.spec.whatwg.org/multipage/introduction.html#a-quick-introduction-to-html:syntax-attributes
                nameAndValue = ` ${escapedAttributeName}`;
            } else {
                nameAndValue = ` ${escapedAttributeName}="${htmlEscape(v, true)}"`;
            }
            attrs.push(nameAndValue);
        } else {
            attrs.push(` ${escapedAttributeName}`);
        }
    };

    element.attributes
        .map((attr) => {
            const { name, value } = attr;

            const hasExpression = isExpression(value);

            // For boolean literals (e.g. `<use xlink:href>`), there is no reason to sanitize since it's empty
            const hasSvgUseHref =
                isSvgUseHref(element.name, name, element.namespace) && !isBooleanLiteral(value);

            // IDs/IDRefs must be handled dynamically at runtime due to synthetic shadow scoping.
            // Note that for backwards compat we only consider non-booleans to be dynamic IDs/IDRefs
            const hasIdOrIdRef =
                (name === 'id' || isIdReferencingAttribute(name)) && !isBooleanLiteral(value);

            // `<a href="#foo">` and `<area href="#foo">` must be dynamic due to synthetic shadow scoping
            // Note this only applies if there is an `id` attribute somewhere in the template
            const hasScopedFragmentRef =
                codeGen.scopeFragmentId &&
                isStringLiteral(value) &&
                isAllowedFragOnlyUrlsXHTML(element.name, name, element.namespace) &&
                isFragmentOnlyUrl(value.value);

            // If we're not running in synthetic shadow mode (light or shadow+disableSyntheticShadowSupport),
            // then static IDs/IDrefs/fragment refs will be rendered directly into HTML strings.
            const needsScoping =
                codeGen.isSyntheticShadow && (hasIdOrIdRef || hasScopedFragmentRef);

            return {
                hasExpression,
                hasSvgUseHref,
                needsScoping,
                name,
                value:
                    hasExpression || hasSvgUseHref || needsScoping
                        ? codeGen.getStaticExpressionToken(attr)
                        : (value as Literal).value,
                elementName: element.name,
            };
        })
        .forEach(collector);

    /* v8 ignore start */
    // TODO [#4775]: allow static optimization for `<input value>`/`<input checked>`
    if (process.env.NODE_ENV === 'test' && element.properties.length > 0) {
        throw new Error(
            'Expected zero properties at this point, found ' + element.properties.length
        );
    }
    /* v8 ignore stop */

    // ${2} maps to style token attribute
    // ${3} maps to class attribute token + style token attribute
    // See buildParseFragmentFn for details.
    return attrs.join('') + (hasClassAttr ? '${2}' : '${3}');
}

function serializeChildren(
    children: (StaticChildNode | Text[])[],
    parentTagName: string,
    codeGen: CodeGen
): string {
    let html = '';

    for (const child of children) {
        /* istanbul ignore else */
        if (isContiguousText(child)) {
            html += hasDynamicText(child)
                ? serializeDynamicTextNode(child, codeGen)
                : serializeChildren(child, parentTagName, codeGen);
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

    // See W-16469970
    const escapedTagName = templateStringEscape(tagName);

    let html = `<${escapedTagName}${serializeAttrs(element, codeGen)}`;

    if (isForeignElement && !hasChildren) {
        html += '/>';
        return html;
    }

    html += '>';

    const children = transformStaticChildren(element, codeGen.preserveComments);
    html += serializeChildren(children, tagName, codeGen);

    if (!isVoidElement(tagName, namespace) || hasChildren) {
        html += `</${escapedTagName}>`;
    }

    return html;
}
