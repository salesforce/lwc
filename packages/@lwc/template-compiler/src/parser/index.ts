/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { hasOwnProperty } from '@lwc/shared';

import {
    CompilerDiagnostic,
    generateCompilerDiagnostic,
    LWCErrorInfo,
    normalizeToDiagnostic,
    ParserDiagnostics,
} from '@lwc/errors';
import { cleanTextNode, decodeTextContent, getSource, parseHTML } from './html';

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
    getParent,
} from './expression';

import * as t from '../shared/estree';
import * as parse5Utils from '../shared/parse5';
import { createComment, createElement, createText, isCustomElement } from '../shared/ir';
import {
    ForEach,
    ForIterator,
    IRAttribute,
    IRAttributeType,
    IRBaseAttribute,
    IRComment,
    IRElement,
    IRExpressionAttribute,
    IRNode,
    IRText,
    LWCDirectiveDomMode,
    LWCDirectiveRenderMode,
    LWCDirectives,
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
    const parentStack: IRElement[] = [];

    const { fragment, errors: parsingErrors } = parseHTML(source);

    if (parsingErrors.length) {
        return { warnings: parsingErrors };
    }

    const templateRoot = getTemplateRoot(fragment);
    if (!templateRoot) {
        return { warnings };
    }

    const root = parseElement(templateRoot);

    function parseElement(elementNode: parse5.Element): IRElement {
        const element = createElement(elementNode);

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
        const children = (parse5Utils.getTemplateContent(__original) ?? __original).childNodes;

        parentStack.push(parent);

        for (const child of children) {
            if (parse5Utils.isElementNode(child)) {
                const elmNode = parseElement(child);
                parsedChildren.push(elmNode);
            } else if (parse5Utils.isTextNode(child)) {
                const textNodes = parseText(child);
                parsedChildren.push(...textNodes);
            } else if (parse5Utils.isCommentNode(child)) {
                const commentNode = parseComment(child);
                parsedChildren.push(commentNode);
            }
        }

        parentStack.pop();

        parent.children = parsedChildren;
    }

    function parseText(node: parse5.TextNode): IRText[] {
        const parsedTextNodes: IRText[] = [];

        // Extract the raw source to avoid HTML entity decoding done by parse5
        const location = node.sourceCodeLocation!;
        const rawText = cleanTextNode(source.slice(location.startOffset, location.endOffset));

        if (!rawText.trim().length) {
            return parsedTextNodes;
        }

        // Split the text node content arround expression and create node for each
        const tokenizedContent = rawText.split(EXPRESSION_RE);

        for (const token of tokenizedContent) {
            // Don't create nodes for emtpy strings
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
                    return parsedTextNodes;
                }
            } else {
                value = decodeTextContent(token);
            }

            parsedTextNodes.push(createText(node, value));
        }

        return parsedTextNodes;
    }

    function parseComment(node: parse5.CommentNode): IRComment {
        const value = decodeTextContent(node.data);
        return createComment(node, value);
    }

    function getTemplateRoot(
        documentFragment: parse5.DocumentFragment
    ): parse5.Element | undefined {
        // Filter all the empty text nodes
        const validRoots = documentFragment.childNodes.filter(
            (child) =>
                parse5Utils.isElementNode(child) ||
                (parse5Utils.isTextNode(child) && child.value.trim().length)
        );

        if (validRoots.length > 1) {
            const duplicateRoot = validRoots[1].sourceCodeLocation!;
            warnAtLocation(ParserDiagnostics.MULTIPLE_ROOTS_FOUND, [], duplicateRoot);
        }

        const [root] = validRoots;

        if (!root || !parse5Utils.isElementNode(root)) {
            warnAtLocation(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
        } else {
            return root;
        }
    }

    function applyHandlers(element: IRElement) {
        let eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        while (eventHandlerAttribute) {
            removeAttribute(element, eventHandlerAttribute.name);

            if (eventHandlerAttribute.type !== IRAttributeType.Expression) {
                return warnOnIRNode(
                    ParserDiagnostics.EVENT_HANDLER_SHOULD_BE_EXPRESSION,
                    eventHandlerAttribute
                );
            }

            let eventName = eventHandlerAttribute.name;
            if (!eventName.match(EVENT_HANDLER_NAME_RE)) {
                return warnOnIRNode(ParserDiagnostics.INVALID_EVENT_NAME, eventHandlerAttribute, [
                    eventName,
                ]);
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
                return warnOnIRNode(
                    ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION,
                    ifAttribute
                );
            }

            const [, modifier] = ifAttribute.name.split(':');
            if (!VALID_IF_MODIFIER.has(modifier)) {
                return warnOnIRNode(ParserDiagnostics.UNEXPECTED_IF_MODIFIER, ifAttribute, [
                    modifier,
                ]);
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

        if (
            !LWC_DIRECTIVE_SET.has(lwcAttribute.name) &&
            !ROOT_TEMPLATE_DIRECTIVES_SET.has(lwcAttribute.name)
        ) {
            // unknown lwc directive
            return warnOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
                lwcAttribute.name,
                `<${element.tag}>`,
            ]);
        }

        const lwcOpts = {};
        applyLwcDynamicDirective(element, lwcOpts);
        applyLwcDomDirective(element, lwcOpts);
        applyLwcRenderModeDirective(element, lwcOpts);
        applyLwcPreserveCommentsDirective(element, lwcOpts);

        element.lwc = lwcOpts;
    }

    function applyLwcRenderModeDirective(element: IRElement, lwcOpts: LWCDirectives) {
        const lwcRenderModeAttribute = getTemplateAttribute(
            element,
            ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE
        );

        if (!lwcRenderModeAttribute) {
            return;
        }

        if (
            lwcRenderModeAttribute.type !== IRAttributeType.String ||
            (lwcRenderModeAttribute.value !== 'shadow' && lwcRenderModeAttribute.value !== 'light')
        ) {
            return warnOnIRNode(ParserDiagnostics.LWC_RENDER_MODE_INVALID_VALUE, element);
        }

        if (parentStack.length > 0) {
            return warnOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
                ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE,
                `<${element.tag}>`,
            ]);
        }

        lwcOpts.renderMode = lwcRenderModeAttribute.value as LWCDirectiveRenderMode;
    }

    function applyLwcPreserveCommentsDirective(element: IRElement, lwcOpts: LWCDirectives) {
        const lwcPreserveCommentAttribute = getTemplateAttribute(
            element,
            ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS
        );

        if (!lwcPreserveCommentAttribute) {
            return;
        }

        if (parentStack.length > 0 || lwcPreserveCommentAttribute.type !== IRAttributeType.Boolean) {
            return warnOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
                ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE,
                `<${element.tag}>`,
            ]);
        }

        lwcOpts.preserveComments = lwcPreserveCommentAttribute;
    }

    function applyLwcDynamicDirective(element: IRElement, lwcOpts: LWCDirectives) {
        const lwcDynamicAttribute = getTemplateAttribute(element, LWC_DIRECTIVES.DYNAMIC);

        if (!lwcDynamicAttribute) {
            return;
        }

        if (!state.config.experimentalDynamicDirective) {
            return warnOnIRNode(ParserDiagnostics.INVALID_OPTS_LWC_DYNAMIC, element, [
                `<${element.tag}>`,
            ]);
        }

        removeAttribute(element, LWC_DIRECTIVES.DYNAMIC);

        if (!isCustomElement(element)) {
            return warnOnIRNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT, element, [
                `<${element.tag}>`,
            ]);
        }

        if (lwcDynamicAttribute.type !== IRAttributeType.Expression) {
            return warnOnIRNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_LITERAL_PROP, element, [
                `<${element.tag}>`,
            ]);
        }

        lwcOpts.dynamic = lwcDynamicAttribute.value;
    }

    function applyLwcDomDirective(element: IRElement, lwcOpts: LWCDirectives) {
        const lwcDomAttribute = getTemplateAttribute(element, LWC_DIRECTIVES.DOM);

        if (!lwcDomAttribute) {
            return;
        }

        removeAttribute(element, LWC_DIRECTIVES.DOM);

        if (getRenderMode(element) === LWCDirectiveRenderMode.light) {
            return warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_IN_LIGHT_DOM, element, [
                `<${element.tag}>`,
            ]);
        }

        if (isCustomElement(element)) {
            return warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT, element, [
                `<${element.tag}>`,
            ]);
        }

        if (element.tag === 'slot') {
            return warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT, element);
        }

        if (
            lwcDomAttribute.type !== IRAttributeType.String ||
            hasOwnProperty.call(LWCDirectiveDomMode, lwcDomAttribute.value) === false
        ) {
            const possibleValues = Object.keys(LWCDirectiveDomMode)
                .map((value) => `"${value}"`)
                .join(', or ');
            return warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element, [possibleValues]);
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
                return warnOnIRNode(
                    ParserDiagnostics.FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION,
                    forEachAttribute
                );
            } else if (forItemAttribute.type !== IRAttributeType.String) {
                return warnOnIRNode(
                    ParserDiagnostics.FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING,
                    forItemAttribute
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
                    return warnOnIRNode(
                        ParserDiagnostics.FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING,
                        forIndex
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
            return warnOnIRNode(
                ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
                element
            );
        }
    }

    function applyIterator(element: IRElement) {
        const iteratorExpression = getTemplateAttribute(element, ITERATOR_RE);

        if (!iteratorExpression) {
            return;
        }

        if (element.forEach) {
            return warnOnIRNode(ParserDiagnostics.INVALID_FOR_EACH_WITH_ITERATOR, element, [
                iteratorExpression.name,
            ]);
        }

        removeAttribute(element, iteratorExpression.name);
        const iteratorAttributeName = iteratorExpression.name;
        const [, iteratorName] = iteratorAttributeName.split(':');

        if (iteratorExpression.type !== IRAttributeType.Expression) {
            return warnOnIRNode(
                ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION,
                iteratorExpression,
                [iteratorExpression.name]
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
                return warnOnIRNode(
                    ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION,
                    keyAttribute,
                    []
                );
            }

            const forOfParent = getForOfParent(parentStack);
            const forEachParent = getForEachParent(element, parentStack);
            if (forOfParent) {
                if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent.forOf!)) {
                    return warnOnIRNode(
                        ParserDiagnostics.KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX,
                        keyAttribute,
                        [element.tag]
                    );
                }
            } else if (forEachParent) {
                if (
                    attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent.forEach!)
                ) {
                    const name = 'name' in keyAttribute.value && keyAttribute.value.name;
                    return warnOnIRNode(
                        ParserDiagnostics.KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX,
                        keyAttribute,
                        [element.tag, name]
                    );
                }
            }
            removeAttribute(element, 'key');

            element.forKey = keyAttribute.value;
        } else if (isIteratorElement(element, parentStack) && element.tag !== 'template') {
            return warnOnIRNode(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, element, [element.tag]);
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
        const { tag, attrsList: attrs } = element;

        // Early exit if the element is not a slot
        if (tag !== 'slot') {
            return;
        }

        if (element.forEach || element.forOf || element.if) {
            return warnOnIRNode(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, element);
        }

        // Can't handle slots in applySlot because it would be too late for class and style attrs
        if (getRenderMode(element) === LWCDirectiveRenderMode.light) {
            const invalidAttrs = attrs
                .filter(({ name }) => name !== 'name')
                .map(({ name }) => name);

            if (invalidAttrs.length > 0) {
                return warnOnIRNode(ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_ATTRIBUTES, element, [
                    invalidAttrs.join(','),
                ]);
            }
        }

        // Default slot have empty string name
        let name = '';

        const nameAttribute = getTemplateAttribute(element, 'name');
        if (nameAttribute) {
            if (nameAttribute.type === IRAttributeType.Expression) {
                return warnOnIRNode(
                    ParserDiagnostics.NAME_ON_SLOT_CANNOT_BE_EXPRESSION,
                    nameAttribute,
                    []
                );
            } else if (nameAttribute.type === IRAttributeType.String) {
                name = nameAttribute.value;
            }
        }

        element.slotName = name;
    }

    function isInIteration(element: IRElement): boolean {
        let current: IRElement | undefined = element;
        let size = parentStack.length;

        while (current) {
            if (current.tag === 'template') {
                if (current.forEach || current.forOf) {
                    return true;
                }
            }
            current = getParent(parentStack, --size);
        }

        return false;
    }

    function applyAttributes(element: IRElement) {
        const { tag, attrsList: attrs } = element;

        attrs.forEach((rawAttr) => {
            const attr = getTemplateAttribute(element, attributeName(rawAttr));
            if (!attr) {
                return;
            }

            const { name } = attr;

            if (!isValidHTMLAttribute(element.tag, name)) {
                warnOnIRNode(ParserDiagnostics.INVALID_HTML_ATTRIBUTE, attr, [name, tag]);
            }

            if (name.match(/[^a-z0-9]$/)) {
                warnOnIRNode(
                    ParserDiagnostics.ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER,
                    attr,
                    [name, tag]
                );
                return;
            }

            if (!/^-*[a-z]/.test(name)) {
                warnOnIRNode(
                    ParserDiagnostics.ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER,
                    attr,
                    [name, tag]
                );
                return;
            }

            // disallow attr name which combines underscore character with special character.
            // We normalize camel-cased names with underscores caMel -> ca-mel; thus sanitization.
            if (name.match(/_[^a-z0-9]|[^a-z0-9]_/)) {
                warnOnIRNode(
                    ParserDiagnostics.ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS,
                    attr,
                    [name, tag]
                );
                return;
            }

            if (attr.type === IRAttributeType.String) {
                if (name === 'id') {
                    const { value } = attr;

                    if (/\s+/.test(value)) {
                        warnOnIRNode(ParserDiagnostics.INVALID_ID_ATTRIBUTE, attr, [value]);
                    }

                    if (isInIteration(element)) {
                        warnOnIRNode(ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION, attr, [
                            value,
                        ]);
                    }

                    if (seenIds.has(value)) {
                        warnOnIRNode(ParserDiagnostics.DUPLICATE_ID_FOUND, attr, [value]);
                    } else {
                        seenIds.add(value);
                    }
                }
            }

            // Prevent usage of the slot attribute with expression.
            if (name === 'slot' && attr.type === IRAttributeType.Expression) {
                return warnOnIRNode(
                    ParserDiagnostics.SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION,
                    attr,
                    []
                );
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
    }

    function validateElement(element: IRElement) {
        const { tag, namespace, location, __original: node } = element;
        const isRoot = !(parentStack.length > 0);

        if (isRoot) {
            if (tag !== 'template') {
                return warnOnIRNode(ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE, element, [tag]);
            }

            const rootHasUnknownAttributes = node.attrs.some(
                ({ name }) => !ROOT_TEMPLATE_DIRECTIVES_SET.has(name)
            );
            if (rootHasUnknownAttributes) {
                return warnOnIRNode(
                    ParserDiagnostics.ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES,
                    element
                );
            }
        }

        // Check if a non-void element has a matching closing tag.
        //
        // Note: Parse5 currently fails to collect end tag location for element with a tag name
        // containing an upper case character (inikulin/parse5#352).
        const hasClosingTag = Boolean(location.endTag);
        const isVoidElement = VOID_ELEMENT_SET.has(element.tag);
        if (!isVoidElement && !hasClosingTag && tag === tag.toLocaleLowerCase()) {
            warnOnIRNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, element, [element.tag]);
        }

        if (tag === 'style' && namespace === HTML_NAMESPACE_URI) {
            warnOnIRNode(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, element);
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
                warnOnIRNode(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, element);
            }
        } else {
            const isNotAllowedHtmlTag = DISALLOWED_HTML_TAGS.has(tag);
            if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
                return warnOnIRNode(ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE, element, [tag]);
            }

            const isNotAllowedSvgTag = !SUPPORTED_SVG_TAGS.has(tag);
            if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
                return warnOnIRNode(
                    ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE,
                    element,
                    [tag]
                );
            }

            const isNotAllowedMathMlTag = DISALLOWED_MATHML_TAGS.has(tag);
            if (namespace === MATHML_NAMESPACE_URI && isNotAllowedMathMlTag) {
                return warnOnIRNode(
                    ParserDiagnostics.FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE,
                    element,
                    [tag]
                );
            }

            const isKnownTag =
                isCustomElement(element) ||
                KNOWN_HTML_ELEMENTS.has(tag) ||
                SUPPORTED_SVG_TAGS.has(tag) ||
                DASHED_TAGNAME_ELEMENT_SET.has(tag);

            if (!isKnownTag) {
                return warnOnIRNode(ParserDiagnostics.UNKNOWN_HTML_TAG_IN_TEMPLATE, element, [tag]);
            }
        }
    }

    function validateChildren(element: IRElement) {
        const effectiveChildren = getPreserveComments(element)
            ? element.children
            : element.children.filter((child) => child.type !== 'comment');
        if (element.lwc?.dom && effectiveChildren.length > 0) {
            return warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element);
        }
    }

    function validateAttributes(element: IRElement) {
        const { tag, attrsList: attrs } = element;

        attrs.forEach((attr) => {
            const attrName = attr.name;

            if (isProhibitedIsAttribute(attrName)) {
                warnOnIRNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element, [
                    attrName,
                    tag,
                ]);
            }

            if (isTabIndexAttribute(attrName)) {
                if (!isExpression(attr.value) && !isValidTabIndexAttributeValue(attr.value)) {
                    warnOnIRNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
                }
            }

            // TODO [#1136]: once the template compiler emits the element namespace information to the engine we should
            // restrict the validation of the "srcdoc" attribute on the "iframe" element only if this element is
            // part of the HTML namespace.
            if (tag === 'iframe' && attrName === 'srcdoc') {
                warnOnIRNode(ParserDiagnostics.FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE, element);
            }
        });
    }

    function validateProperties(element: IRElement) {
        const { tag, props } = element;

        if (props !== undefined) {
            for (const propName in props) {
                const { name: attrName, type, value } = props[propName];

                if (isProhibitedIsAttribute(attrName)) {
                    warnOnIRNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element, [
                        attrName,
                        tag,
                    ]);
                }

                if (
                    isTabIndexAttribute(attrName) &&
                    type !== IRAttributeType.Expression &&
                    !isValidTabIndexAttributeValue(value)
                ) {
                    warnOnIRNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
                }
            }
        }
    }

    function getTemplateAttribute(
        el: IRElement,
        pattern: string | RegExp
    ): IRAttribute | undefined {
        const matching = getAttribute(el, pattern);
        if (!matching) {
            return;
        }

        const name = matching.prefix ? `${matching.prefix}:${matching.name}` : matching.name;

        // Convert attribute name to lowercase because the location map keys follow the algorithm defined in the spec
        // https://wicg.github.io/controls-list/html-output/multipage/syntax.html#attribute-name-state
        const location = el.location.attrs[name.toLowerCase()];
        const rawAttribute = getSource(source, location);

        // parse5 automatically converts the casing from camelcase to all lowercase. If the attribute name
        // is not the same before and after the parsing, then the attribute name contains capital letters
        if (!rawAttribute.startsWith(name)) {
            warnAtLocation(
                ParserDiagnostics.INVALID_ATTRIBUTE_CASE,
                [rawAttribute, el.tag],
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

    function getRoot(element: IRElement): IRElement {
        return parentStack.length > 0 ? parentStack[0] : element;
    }

    function getRenderMode(element: IRElement): LWCDirectiveRenderMode {
        return getRoot(element).lwc?.renderMode ?? LWCDirectiveRenderMode.shadow;
    }

    function getPreserveComments(element: IRElement): boolean {
        return getRoot(element).lwc?.preserveComments?.value ?? state.config.preserveHtmlComments;
    }

    function warnOnIRNode(
        errorInfo: LWCErrorInfo,
        irNode: IRNode | IRBaseAttribute,
        messageArgs?: any[]
    ) {
        warnAtLocation(errorInfo, messageArgs, irNode.location);
    }

    function warnAtLocation(
        errorInfo: LWCErrorInfo,
        messageArgs?: any[],
        location?: parse5.Location
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

    function normalizeLocation(location?: parse5.Location): {
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

            line = location.startLine;
            column = location.startCol;
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
