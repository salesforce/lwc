/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5-with-errors';
import { hasOwnProperty } from '@lwc/shared';

import {
    CompilerDiagnostic,
    generateCompilerDiagnostic,
    LWCErrorInfo,
    normalizeToDiagnostic,
    ParserDiagnostics,
} from '@lwc/errors';
import { cleanTextNode, decodeTextContent, getSource, parseHTML, treeAdapter } from './html';

import {
    attributeName,
    attributeToPropertyName,
    getAttribute,
    isAttribute,
    isProhibitedIsAttribute,
    isTabIndexAttribute,
    isValidHTMLAttribute,
    isValidTabIndexAttributeValue,
    normalizeAttributeValue,
    removeAttribute,
} from './attribute';

import {
    getForEachParent,
    getForOfParent,
    isExpression,
    isIteratorElement,
    parseExpression,
    parseIdentifier,
} from './expression';

import * as t from '../shared/estree';
import {
    createComment,
    createElement,
    createInterpolatedText,
    createText,
    isCustomElement,
} from '../shared/ir';
import {
    ForEach,
    ForIterator,
    IRAttribute,
    IRAttributeType,
    IRComment,
    IRElement,
    IRExpressionAttribute,
    IRInterpolatedText,
    IRNode,
    IRText,
    isLWCDirectiveRenderMode,
    LWCDirectiveDomMode,
    LWCDirectiveRenderMode,
    LWCDirectives,
    TemplateExpression,
    TemplateIdentifier,
    TemplateParseResult,
} from '../shared/types';

import State from '../state';

import {
    DASHED_TAGNAME_ELEMENT_SET,
    DISALLOWED_HTML_TAGS,
    DISALLOWED_MATHML_TAGS,
    EVENT_HANDLER_NAME_RE,
    EVENT_HANDLER_RE,
    EXPRESSION_RE,
    HTML_NAMESPACE_URI,
    IF_RE,
    ITERATOR_RE,
    KNOWN_HTML_ELEMENTS,
    LWC_DIRECTIVE_SET,
    LWC_DIRECTIVES,
    LWC_RE,
    MATHML_NAMESPACE_URI,
    ROOT_TEMPLATE_DIRECTIVES,
    ROOT_TEMPLATE_DIRECTIVES_SET,
    SUPPORTED_SVG_TAGS,
    SVG_NAMESPACE_URI,
    VALID_IF_MODIFIER,
    VOID_ELEMENT_SET,
} from './constants';

function attributeExpressionReferencesForOfIndex(
    attribute: IRExpressionAttribute,
    forOf: ForIterator
): boolean {
    const { value } = attribute;
    // if not an expression, it is not referencing iterator index
    if (!t.isMemberExpression(value)) {
        return false;
    }

    const { object, property } = value;
    if (!t.isIdentifier(object) || !t.isIdentifier(property)) {
        return false;
    }

    if (forOf.iterator.name !== object.name) {
        return false;
    }

    return property.name === 'index';
}

function attributeExpressionReferencesForEachIndex(
    attribute: IRExpressionAttribute,
    forEach: ForEach
): boolean {
    const { index } = forEach;
    const { value } = attribute;

    // No index defined on foreach
    if (!index || !t.isIdentifier(index) || !t.isIdentifier(value)) {
        return false;
    }

    return index.name === value.name;
}

export default function parse(source: string, state: State): TemplateParseResult {
    const warnings: CompilerDiagnostic[] = [];
    const seenIds: Set<string> = new Set();

    const { fragment, errors: parsingErrors } = parseHTML(source);

    if (parsingErrors.length) {
        return { warnings: parsingErrors };
    }

    const templateRoot = getTemplateRoot(fragment);
    if (!templateRoot) {
        return { warnings };
    }

    const preserveComments =
        templateRoot.attrs.some(
            ({ name }) => name === ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS
        ) || state.config.preserveHtmlComments;

    const renderModeAttribute = templateRoot.attrs.find(
        ({ name }) => name === ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE
    );
    if (renderModeAttribute) {
        const renderMode = renderModeAttribute.value;
        if (isLWCDirectiveRenderMode(renderMode)) {
            state.renderMode = renderMode;
        } else {
            const possibleValues = Object.values(LWCDirectiveRenderMode)
                .map((value) => `"${value}"`)
                .join(', or ');
            warnOnElement(ParserDiagnostics.LWC_RENDER_MODE_INVALID_VALUE, templateRoot, [
                possibleValues,
            ]);
        }
    }

    const root = parseElement(templateRoot);

    function parseElement(elementNode: parse5.AST.Default.Element, parent?: IRElement): IRElement {
        const element = createElement(elementNode, parent);

        applyForEach(element);
        applyIterator(element);
        applyIf(element);
        applyHandlers(element);
        applyComponent(element);
        applySlot(element);
        applyKey(element);
        applyLwcDirectives(element);
        applyAttributes(element);
        validateElement(element);
        validateAttributes(element);
        validateProperties(element);

        parseChildren(element);
        validateChildren(element);

        return element;
    }

    function parseChildren(parent: IRElement): void {
        const { __original } = parent;

        const parsedChildren: IRNode[] = [];
        const children = treeAdapter.getChildNodes(
            treeAdapter.getTemplateContent(__original) ?? __original
        );

        for (const child of children) {
            if (treeAdapter.isElementNode(child)) {
                const elmNode = parseElement(child, parent);
                parsedChildren.push(elmNode);
            } else if (treeAdapter.isTextNode(child)) {
                const textNode = parseText(child, parent);
                if (textNode !== undefined) {
                    parsedChildren.push(textNode);
                }
            } else if (treeAdapter.isCommentNode(child) && preserveComments) {
                const commentNode = parseComment(child, parent);
                parsedChildren.push(commentNode);
            }
        }

        parent.children = parsedChildren;
    }

    function parseText(
        node: parse5.AST.Default.TextNode,
        parent: IRElement
    ): IRText | IRInterpolatedText | undefined {
        const parsedTextParts: Array<string | TemplateExpression> = [];

        // Extract the raw source to avoid HTML entity decoding done by parse5
        const location = node.__location!;
        const rawText = cleanTextNode(source.slice(location.startOffset, location.endOffset));

        if (!rawText.trim().length) {
            return;
        }

        // Split the text node content around expressions and create node for each
        const tokenizedContent = rawText.split(EXPRESSION_RE);

        for (const token of tokenizedContent) {
            // Don't create nodes for empty strings
            if (!token.length) {
                continue;
            }

            let value;
            if (isExpression(token)) {
                try {
                    value = parseExpression(token, state);
                } catch (error) {
                    addDiagnostic(
                        normalizeToDiagnostic(
                            ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                            error,
                            {
                                location: normalizeLocation(location),
                            }
                        )
                    );
                    return parsedTextParts.length
                        ? createInterpolatedText(node, parent, parsedTextParts)
                        : undefined;
                }
            } else {
                value = decodeTextContent(token);
            }

            parsedTextParts.push(value);
        }

        return parsedTextParts.length === 1
            ? createText(node, parent, parsedTextParts[0])
            : createInterpolatedText(node, parent, parsedTextParts);
    }

    function parseComment(node: parse5.AST.Default.CommentNode, parent: IRElement): IRComment {
        const value = decodeTextContent(node.data);
        return createComment(node, parent, value);
    }

    function getTemplateRoot(
        documentFragment: parse5.AST.Default.DocumentFragment
    ): parse5.AST.Default.Element | undefined {
        // Filter all the empty text nodes
        const validRoots = documentFragment.childNodes.filter(
            (child) =>
                treeAdapter.isElementNode(child) ||
                (treeAdapter.isTextNode(child) && child.value.trim().length)
        );

        if (validRoots.length > 1) {
            warnOnElement(ParserDiagnostics.MULTIPLE_ROOTS_FOUND, documentFragment.childNodes[1]);
        }

        const [root] = validRoots;

        if (!root || !treeAdapter.isElementNode(root)) {
            warnAt(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
        } else {
            return root;
        }
    }

    function applyHandlers(element: IRElement) {
        let eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        while (eventHandlerAttribute) {
            removeAttribute(element, eventHandlerAttribute.name);

            if (eventHandlerAttribute.type !== IRAttributeType.Expression) {
                return warnAt(
                    ParserDiagnostics.EVENT_HANDLER_SHOULD_BE_EXPRESSION,
                    [],
                    eventHandlerAttribute.location
                );
            }

            let eventName = eventHandlerAttribute.name;
            if (!eventName.match(EVENT_HANDLER_NAME_RE)) {
                return warnAt(
                    ParserDiagnostics.INVALID_EVENT_NAME,
                    [eventName],
                    eventHandlerAttribute.location
                );
            }

            // Strip the `on` prefix from the event handler name
            eventName = eventHandlerAttribute.name.slice(2);

            const on = element.on || (element.on = {});
            on[eventName] = eventHandlerAttribute.value;

            eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        }
    }

    function applyIf(element: IRElement) {
        const ifAttribute = getTemplateAttribute(element, IF_RE);
        if (ifAttribute) {
            removeAttribute(element, IF_RE);

            if (ifAttribute.type !== IRAttributeType.Expression) {
                return warnAt(
                    ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION,
                    [],
                    ifAttribute.location
                );
            }

            const [, modifier] = ifAttribute.name.split(':');
            if (!VALID_IF_MODIFIER.has(modifier)) {
                return warnAt(
                    ParserDiagnostics.UNEXPECTED_IF_MODIFIER,
                    [modifier],
                    ifAttribute.location
                );
            }

            element.if = ifAttribute.value;
            element.ifModifier = modifier;
        }
    }

    function applyLwcDirectives(element: IRElement) {
        const lwcAttribute = getTemplateAttribute(element, LWC_RE);
        if (!lwcAttribute) {
            return;
        }

        if (element.parent === undefined && ROOT_TEMPLATE_DIRECTIVES_SET.has(lwcAttribute.name)) {
            return;
        }

        if (!LWC_DIRECTIVE_SET.has(lwcAttribute.name)) {
            // unknown lwc directive
            return warnOnElement(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element.__original, [
                lwcAttribute.name,
                `<${element.tag}>`,
            ]);
        }

        const lwcOpts = {};
        applyLwcDynamicDirective(element, lwcOpts);
        applyLwcDomDirective(element, lwcOpts);

        element.lwc = lwcOpts;
    }

    function applyLwcDynamicDirective(element: IRElement, lwcOpts: LWCDirectives) {
        const lwcDynamicAttribute = getTemplateAttribute(element, LWC_DIRECTIVES.DYNAMIC);

        if (!lwcDynamicAttribute) {
            return;
        }

        if (!state.config.experimentalDynamicDirective) {
            return warnOnElement(ParserDiagnostics.INVALID_OPTS_LWC_DYNAMIC, element.__original, [
                `<${element.tag}>`,
            ]);
        }

        removeAttribute(element, LWC_DIRECTIVES.DYNAMIC);

        if (!isCustomElement(element)) {
            return warnOnElement(
                ParserDiagnostics.INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT,
                element.__original,
                [`<${element.tag}>`]
            );
        }

        if (lwcDynamicAttribute.type !== IRAttributeType.Expression) {
            return warnOnElement(
                ParserDiagnostics.INVALID_LWC_DYNAMIC_LITERAL_PROP,
                element.__original,
                [`<${element.tag}>`]
            );
        }

        lwcOpts.dynamic = lwcDynamicAttribute.value;
    }

    function applyLwcDomDirective(element: IRElement, lwcOpts: LWCDirectives) {
        const lwcDomAttribute = getTemplateAttribute(element, LWC_DIRECTIVES.DOM);

        if (!lwcDomAttribute) {
            return;
        }

        removeAttribute(element, LWC_DIRECTIVES.DOM);

        if (state.renderMode === LWCDirectiveRenderMode.light) {
            return warnOnElement(
                ParserDiagnostics.LWC_DOM_INVALID_IN_LIGHT_DOM,
                element.__original,
                [`<${element.tag}>`]
            );
        }

        if (isCustomElement(element)) {
            return warnOnElement(
                ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT,
                element.__original,
                [`<${element.tag}>`]
            );
        }

        if (element.tag === 'slot') {
            return warnOnElement(
                ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT,
                element.__original
            );
        }

        if (
            lwcDomAttribute.type !== IRAttributeType.String ||
            hasOwnProperty.call(LWCDirectiveDomMode, lwcDomAttribute.value) === false
        ) {
            const possibleValues = Object.keys(LWCDirectiveDomMode)
                .map((value) => `"${value}"`)
                .join(', or ');
            return warnOnElement(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element.__original, [
                possibleValues,
            ]);
        }

        lwcOpts.dom = lwcDomAttribute.value as LWCDirectiveDomMode;
    }

    function applyForEach(element: IRElement) {
        const forEachAttribute = getTemplateAttribute(element, 'for:each');
        const forItemAttribute = getTemplateAttribute(element, 'for:item');
        const forIndex = getTemplateAttribute(element, 'for:index');

        if (forEachAttribute && forItemAttribute) {
            // If both directives are defined
            removeAttribute(element, forEachAttribute.name);
            removeAttribute(element, forItemAttribute.name);

            if (forEachAttribute.type !== IRAttributeType.Expression) {
                return warnAt(
                    ParserDiagnostics.FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION,
                    [],
                    forEachAttribute.location
                );
            } else if (forItemAttribute.type !== IRAttributeType.String) {
                return warnAt(
                    ParserDiagnostics.FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING,
                    [],
                    forItemAttribute.location
                );
            }

            let item: TemplateIdentifier;
            try {
                item = parseIdentifier(forItemAttribute.value);
            } catch (error) {
                return addDiagnostic(
                    normalizeToDiagnostic(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, {
                        location: normalizeLocation(forItemAttribute.location),
                    })
                );
            }

            let index: TemplateIdentifier | undefined;
            if (forIndex) {
                removeAttribute(element, forIndex.name);
                if (forIndex.type !== IRAttributeType.String) {
                    return warnAt(
                        ParserDiagnostics.FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING,
                        [],
                        forIndex.location
                    );
                }

                try {
                    index = parseIdentifier(forIndex.value);
                } catch (error) {
                    return addDiagnostic(
                        normalizeToDiagnostic(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, {
                            location: normalizeLocation(forIndex.location),
                        })
                    );
                }
            }

            element.forEach = {
                expression: forEachAttribute.value,
                item,
                index,
            };
        } else if (forEachAttribute || forItemAttribute) {
            // If only one directive is defined
            return warnOnElement(
                ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
                element.__original
            );
        }
    }

    function applyIterator(element: IRElement) {
        const iteratorExpression = getTemplateAttribute(element, ITERATOR_RE);

        if (!iteratorExpression) {
            return;
        }

        removeAttribute(element, iteratorExpression.name);
        const iteratorAttributeName = iteratorExpression.name;
        const [, iteratorName] = iteratorAttributeName.split(':');

        if (iteratorExpression.type !== IRAttributeType.Expression) {
            return warnAt(
                ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION,
                [iteratorExpression.name],
                iteratorExpression.location
            );
        }

        let iterator: TemplateIdentifier;
        try {
            iterator = parseIdentifier(iteratorName);
        } catch (error) {
            return addDiagnostic(
                normalizeToDiagnostic(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, {
                    location: normalizeLocation(iteratorExpression.location),
                })
            );
        }

        element.forOf = {
            expression: iteratorExpression.value,
            iterator,
        };
    }

    function applyKey(element: IRElement) {
        const keyAttribute = getTemplateAttribute(element, 'key');
        if (keyAttribute) {
            if (keyAttribute.type !== IRAttributeType.Expression) {
                return warnAt(
                    ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION,
                    [],
                    keyAttribute.location
                );
            }

            const forOfParent = getForOfParent(element);
            const forEachParent = getForEachParent(element);
            if (forOfParent) {
                if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent.forOf!)) {
                    return warnAt(
                        ParserDiagnostics.KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX,
                        [element.tag],
                        keyAttribute.location
                    );
                }
            } else if (forEachParent) {
                if (
                    attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent.forEach!)
                ) {
                    const name = 'name' in keyAttribute.value && keyAttribute.value.name;
                    return warnAt(
                        ParserDiagnostics.KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX,
                        [element.tag, name],
                        keyAttribute.location
                    );
                }
            }
            removeAttribute(element, 'key');

            element.forKey = keyAttribute.value;
        } else if (isIteratorElement(element) && element.tag !== 'template') {
            return warnAt(
                ParserDiagnostics.MISSING_KEY_IN_ITERATOR,
                [element.tag],
                element.__original.__location!
            );
        }
    }

    function applyComponent(element: IRElement) {
        const { tag } = element;

        // Check if the element tag is a valid custom element name and is not part of known standard
        // element name containing a dash.
        if (!tag.includes('-') || DASHED_TAGNAME_ELEMENT_SET.has(tag)) {
            return;
        }

        element.component = tag;
    }

    function applySlot(element: IRElement) {
        const { tag, attrsList } = element;

        // Early exit if the element is not a slot
        if (tag !== 'slot') {
            return;
        }

        if (element.forEach || element.forOf || element.if) {
            return warnOnElement(
                ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES,
                element.__original
            );
        }

        if (state.renderMode === LWCDirectiveRenderMode.light) {
            const invalidAttrs = attrsList
                .filter(({ name }) => name !== 'name')
                .map(({ name }) => name);
            if (invalidAttrs.length > 0) {
                return warnOnElement(
                    ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_ATTRIBUTES,
                    element.__original,
                    [invalidAttrs.join(',')]
                );
            }
        }

        // Default slot have empty string name
        let name = '';

        const nameAttribute = getTemplateAttribute(element, 'name');
        if (nameAttribute) {
            if (nameAttribute.type === IRAttributeType.Expression) {
                return warnAt(
                    ParserDiagnostics.NAME_ON_SLOT_CANNOT_BE_EXPRESSION,
                    [],
                    nameAttribute.location
                );
            } else if (nameAttribute.type === IRAttributeType.String) {
                name = nameAttribute.value;
            }
        }

        element.slotName = name;
    }

    function isInIteration(element: IRElement): boolean {
        if (element.tag === 'template') {
            if (element.forEach || element.forOf) {
                return true;
            }
        }
        if (element.parent) {
            return isInIteration(element.parent);
        }
        return false;
    }

    function applyAttributes(element: IRElement) {
        const { tag, attrsList } = element;

        attrsList.forEach((rawAttr) => {
            const attr = getTemplateAttribute(element, attributeName(rawAttr));
            if (!attr) {
                return;
            }

            const { name, location } = attr;

            if (!isValidHTMLAttribute(element.tag, name)) {
                warnAt(ParserDiagnostics.INVALID_HTML_ATTRIBUTE, [name, tag], location);
            }

            if (name.match(/[^a-z0-9]$/)) {
                warnAt(ParserDiagnostics.ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER, [
                    name,
                    tag,
                ]);
                return;
            }

            if (!/^-*[a-z]/.test(name)) {
                warnAt(
                    ParserDiagnostics.ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER,
                    [name, tag]
                );
                return;
            }

            // disallow attr name which combines underscore character with special character.
            // We normalize camel-cased names with underscores caMel -> ca-mel; thus sanitization.
            if (name.match(/_[^a-z0-9]|[^a-z0-9]_/)) {
                warnAt(
                    ParserDiagnostics.ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS,
                    [name, tag]
                );
                return;
            }

            if (attr.type === IRAttributeType.String) {
                if (name === 'id') {
                    const { value } = attr;

                    if (/\s+/.test(value)) {
                        warnAt(ParserDiagnostics.INVALID_ID_ATTRIBUTE, [value], location);
                    }

                    if (isInIteration(element)) {
                        warnAt(ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION, [value], location);
                    }

                    if (seenIds.has(value)) {
                        warnAt(ParserDiagnostics.DUPLICATE_ID_FOUND, [value], location);
                    } else {
                        seenIds.add(value);
                    }
                }
            }

            // Prevent usage of the slot attribute with expression.
            if (name === 'slot' && attr.type === IRAttributeType.Expression) {
                return warnAt(ParserDiagnostics.SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION, [], location);
            }

            // the if branch handles
            // 1. All attributes for standard elements except 1 case are handled as attributes
            // 2. For custom elements, only key, slot and data are handled as attributes, rest as properties
            if (isAttribute(element, name)) {
                const attrs = element.attrs || (element.attrs = {});
                attrs[name] = attr;
            } else {
                const props = element.props || (element.props = {});
                props[attributeToPropertyName(name)] = attr;

                removeAttribute(element, name);
            }
        });

        if (!state.shouldScopeFragmentId && (element.props?.id || element.attrs?.id)) {
            state.shouldScopeFragmentId = true;
        }
    }

    function validateElement(element: IRElement) {
        const { tag, parent, __original: node } = element;
        const isRoot = !parent;

        if (isRoot) {
            if (tag !== 'template') {
                return warnOnElement(ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE, node, [tag]);
            }

            const rootHasUnknownAttributes = node.attrs.some(
                ({ name }) => !ROOT_TEMPLATE_DIRECTIVES_SET.has(name)
            );
            if (rootHasUnknownAttributes) {
                return warnOnElement(ParserDiagnostics.ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES, node);
            }
        }

        const { startTag, endTag } = node.__location!;
        const isVoidElement = VOID_ELEMENT_SET.has(element.tag);
        const hasClosingTag = !!startTag && endTag;

        if (!isVoidElement && !hasClosingTag) {
            addDiagnostic(
                generateCompilerDiagnostic(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, {
                    messageArgs: [element.tag],
                    origin: {
                        location: {
                            line: startTag.startLine || startTag.line,
                            column: startTag.startCol || startTag.col,
                            start: startTag.startOffset,
                            length: startTag.endOffset - startTag.startOffset,
                        },
                    },
                })
            );
        }

        if (tag === 'style' && node.namespaceURI === HTML_NAMESPACE_URI) {
            warnOnElement(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, node);
        } else if (tag === 'template') {
            // We check if the template element has some modifier applied to it. Directly checking if one of the
            // IRElement property is impossible. For example when an error occurs during the parsing of the if
            // expression, the `element.if` property remains undefined. It would results in 2 warnings instead of 1:
            //      - Invalid if expression
            //      - Unexpected template element
            //
            // Checking if the original HTMLElement has some attributes applied is a good enough for now.
            const hasAttributes = node.attrs.length !== 0;
            if (!isRoot && !hasAttributes) {
                warnOnElement(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, node);
            }
        } else {
            const namespace = node.namespaceURI;

            const isNotAllowedHtmlTag = DISALLOWED_HTML_TAGS.has(tag);
            if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
                return warnOnElement(ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE, node, [tag]);
            }

            const isNotAllowedSvgTag = !SUPPORTED_SVG_TAGS.has(tag);
            if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
                return warnOnElement(ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE, node, [
                    tag,
                ]);
            }

            const isNotAllowedMathMlTag = DISALLOWED_MATHML_TAGS.has(tag);
            if (namespace === MATHML_NAMESPACE_URI && isNotAllowedMathMlTag) {
                return warnOnElement(
                    ParserDiagnostics.FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE,
                    node,
                    [tag]
                );
            }

            const isKnownTag =
                isCustomElement(element) ||
                KNOWN_HTML_ELEMENTS.has(tag) ||
                SUPPORTED_SVG_TAGS.has(tag) ||
                DASHED_TAGNAME_ELEMENT_SET.has(tag);

            if (!isKnownTag) {
                return warnOnElement(ParserDiagnostics.UNKNOWN_HTML_TAG_IN_TEMPLATE, node, [tag]);
            }
        }
    }

    function validateChildren(element: IRElement) {
        if (element.lwc?.dom && element.children.length > 0) {
            return warnOnElement(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element.__original);
        }
    }

    function validateAttributes(element: IRElement) {
        const { tag, attrsList, __original: node } = element;

        attrsList.forEach((attr) => {
            const attrName = attr.name;

            if (isProhibitedIsAttribute(attrName)) {
                warnOnElement(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, node, [attrName, tag]);
            }

            if (isTabIndexAttribute(attrName)) {
                if (!isExpression(attr.value) && !isValidTabIndexAttributeValue(attr.value)) {
                    warnOnElement(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, node);
                }
            }

            // TODO [#1136]: once the template compiler emits the element namespace information to the engine we should
            // restrict the validation of the "srcdoc" attribute on the "iframe" element only if this element is
            // part of the HTML namespace.
            if (tag === 'iframe' && attrName === 'srcdoc') {
                warnOnElement(ParserDiagnostics.FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE, node);
            }
        });
    }

    function validateProperties(element: IRElement) {
        const { tag, props, __original: node } = element;

        if (props !== undefined) {
            for (const propName in props) {
                const { name: attrName, type, value } = props[propName];

                if (isProhibitedIsAttribute(attrName)) {
                    warnOnElement(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, node, [
                        attrName,
                        tag,
                    ]);
                }

                if (isTabIndexAttribute(attrName)) {
                    if (
                        type !== IRAttributeType.Expression &&
                        !isValidTabIndexAttributeValue(value)
                    ) {
                        warnOnElement(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, node);
                    }
                }
            }
        }
    }

    function getTemplateAttribute(
        el: IRElement,
        pattern: string | RegExp
    ): IRAttribute | undefined {
        const node = el.__original;
        const nodeLocation = node.__location!;

        const matching = getAttribute(el, pattern);
        if (!matching) {
            return;
        }

        const name = matching.prefix ? `${matching.prefix}:${matching.name}` : matching.name;

        // Convert attribute name to lowercase because the location map keys follow the algorithm defined in the spec
        // https://wicg.github.io/controls-list/html-output/multipage/syntax.html#attribute-name-state
        const location = nodeLocation.attrs[name.toLowerCase()];
        const rawAttribute = getSource(source, location);

        // parse5 automatically converts the casing from camelcase to all lowercase. If the attribute name
        // is not the same before and after the parsing, then the attribute name contains capital letters
        if (!rawAttribute.startsWith(name)) {
            warnAt(
                ParserDiagnostics.INVALID_ATTRIBUTE_CASE,
                [rawAttribute, treeAdapter.getTagName(node)],
                location
            );
            return;
        }

        try {
            const isBooleanAttribute = !rawAttribute.includes('=');
            const { value, escapedExpression } = normalizeAttributeValue(
                matching,
                rawAttribute,
                el.tag
            );
            if (isExpression(value) && !escapedExpression) {
                return {
                    name,
                    location,
                    type: IRAttributeType.Expression,
                    value: parseExpression(value, state),
                };
            } else if (isBooleanAttribute) {
                return {
                    name,
                    location,
                    type: IRAttributeType.Boolean,
                    value: true,
                };
            } else {
                return {
                    name,
                    location,
                    type: IRAttributeType.String,
                    value,
                };
            }
        } catch (error) {
            // Removes the attribute, if impossible to parse it value.
            removeAttribute(el, name);
            addDiagnostic(
                normalizeToDiagnostic(ParserDiagnostics.GENERIC_PARSING_ERROR, error, {
                    location: normalizeLocation(location),
                })
            );
        }
    }

    function warnOnElement(
        errorInfo: LWCErrorInfo,
        node: parse5.AST.Default.Node,
        messageArgs?: any[]
    ) {
        const getLocation = (
            toLocate?: parse5.AST.Node
        ): { line: number; column: number; start: number; length: number } => {
            if (!toLocate) {
                return { line: 0, column: 0, start: 0, length: 0 };
            }

            const location = (toLocate as parse5.AST.Default.Element).__location;

            if (!location) {
                return getLocation(treeAdapter.getParentNode(toLocate));
            } else {
                return {
                    line: location.line || location.startLine,
                    column: location.col || location.startCol,
                    start: location.startOffset,
                    length: location.endOffset - location.startOffset,
                };
            }
        };

        addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: getLocation(node),
                },
            })
        );
    }

    function warnAt(
        errorInfo: LWCErrorInfo,
        messageArgs?: any[],
        location?: parse5.MarkupData.Location
    ) {
        addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: normalizeLocation(location),
                },
            })
        );
    }

    // TODO [#1286]: Update parse5-with-error to match version used for jsdom (interface for ElementLocation changed)
    function normalizeLocation(location?: parse5.MarkupData.Location): {
        line: number;
        column: number;
        start: number;
        length: number;
    } {
        let line = 0;
        let column = 0;
        let start = 0;
        let length = 0;

        if (location) {
            const { startOffset, endOffset } = location;

            line = location.line || location.startLine;
            column = location.col || location.startCol;
            start = startOffset;
            length = endOffset - startOffset;
        }
        return { line, column, start, length };
    }

    function addDiagnostic(diagnostic: CompilerDiagnostic) {
        warnings.push(diagnostic);
    }

    return { root, warnings };
}
