/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { hasOwnProperty } from '@lwc/shared';

import { CompilerError, ParserDiagnostics } from '@lwc/errors';
import { cleanTextNode, decodeTextContent, parseHTML } from './html';

import {
    attributeName,
    attributeToPropertyName,
    isAttribute,
    isProhibitedIsAttribute,
    isTabIndexAttribute,
    isValidHTMLAttribute,
    isValidTabIndexAttributeValue,
    normalizeAttributeValue,
    ParsedAttribute,
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
import * as parse5Utils from '../shared/parse5';
import {
    createComment,
    createElement,
    createText,
    isCustomElement,
    isIRExpressionAttribute,
    isIRStringAttribute,
} from '../shared/ir';
import {
    ForEach,
    ForIterator,
    IRAttribute,
    IRAttributeType,
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

import ParserCtx from './parser';

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
    FOR_DIRECTIVES,
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
    const ctx = new ParserCtx(source, state.config);
    const fragment = parseHTML(ctx, source);

    if (ctx.warnings.length) {
        return { warnings: ctx.warnings };
    }

    const templateRoot = getTemplateRoot(ctx, fragment);
    if (!templateRoot) {
        return { warnings: ctx.warnings };
    }

    const root = parseElement(ctx, templateRoot);

    return { root, warnings: ctx.warnings };
}

function parseElement(ctx: ParserCtx, elementNode: parse5.Element): IRElement | undefined {
    const element = createElement(elementNode);
    const parsedAttr = parseAttributes(ctx, element, elementNode);

    try {
        applyForEach(ctx, element, parsedAttr);
        applyIterator(ctx, element, parsedAttr);
        applyIf(ctx, element, parsedAttr);
        applyHandlers(ctx, element, parsedAttr);
        applyComponent(element);
        applySlot(ctx, element, parsedAttr);
        applyKey(ctx, element, parsedAttr);
        applyLwcDirectives(ctx, element, parsedAttr);
        applyAttributes(ctx, element, parsedAttr);
        validateElement(ctx, element, elementNode);
        validateAttributes(ctx, element, parsedAttr);
        validateProperties(ctx, element);

        parseChildren(ctx, element, elementNode);
        validateChildren(ctx, element);

        // jtu revist this one
        return element;
    } catch (error) {
        // do nothing.

        if (error instanceof CompilerError) {
            ctx.warning.addDiagnostic(error.toDiagnostic());
        }
    }
}

function parseChildren(ctx: ParserCtx, parent: IRElement, parse5Parent: parse5.Element): void {
    const parsedChildren: IRNode[] = [];
    const children = (parse5Utils.getTemplateContent(parse5Parent) ?? parse5Parent).childNodes;

    ctx.parentStack.push(parent);

    for (const child of children) {
        if (parse5Utils.isElementNode(child)) {
            const elmNode = parseElement(ctx, child);
            // jtu come back to this
            elmNode && parsedChildren.push(elmNode);
        } else if (parse5Utils.isTextNode(child)) {
            const textNodes = parseText(ctx, child);
            parsedChildren.push(...textNodes);
        } else if (parse5Utils.isCommentNode(child)) {
            const commentNode = parseComment(child);
            parsedChildren.push(commentNode);
        }
    }

    ctx.parentStack.pop();

    parent.children = parsedChildren;
}

function parseText(ctx: ParserCtx, node: parse5.TextNode): IRText[] {
    const parsedTextNodes: IRText[] = [];

    // Extract the raw source to avoid HTML entity decoding done by parse5
    const location = node.sourceCodeLocation!;
    const rawText = cleanTextNode(ctx.getSource(location.startOffset, location.endOffset));

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
                value = parseExpression(token, ctx.config);
            } catch (error) {
                ctx.warning.warnOnError(
                    ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                    error,
                    location
                );
                // addDiagnostic(
                //     normalizeToDiagnostic(
                //         ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                //         error,
                //         {
                //             location: normalizeLocation(location),
                //         }
                //     )
                // );
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
    ctx: ParserCtx,
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
        ctx.warning.warnAtLocation(ParserDiagnostics.MULTIPLE_ROOTS_FOUND, [], duplicateRoot);
    }

    const [root] = validRoots;

    if (!root || !parse5Utils.isElementNode(root)) {
        ctx.warning.warnAtLocation(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
    } else {
        return root;
    }
}

function applyHandlers(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    let eventHandlerAttribute = parsedAttr.pick(EVENT_HANDLER_RE);
    while (eventHandlerAttribute) {
        if (eventHandlerAttribute.type !== IRAttributeType.Expression) {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.EVENT_HANDLER_SHOULD_BE_EXPRESSION,
                eventHandlerAttribute
            );
        }

        let eventName = eventHandlerAttribute.name;
        if (!eventName.match(EVENT_HANDLER_NAME_RE)) {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.INVALID_EVENT_NAME,
                eventHandlerAttribute,
                [eventName]
            );
        }

        // Strip the `on` prefix from the event handler name
        eventName = eventHandlerAttribute.name.slice(2);

        const on = element.on || (element.on = {});
        on[eventName] = eventHandlerAttribute.value;

        eventHandlerAttribute = parsedAttr.pick(EVENT_HANDLER_RE);
    }
}

function applyIf(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const ifAttribute = parsedAttr.pick(IF_RE);
    if (ifAttribute) {
        if (ifAttribute.type !== IRAttributeType.Expression) {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION,
                ifAttribute
            );
        }

        const [, modifier] = ifAttribute.name.split(':');
        if (!VALID_IF_MODIFIER.has(modifier)) {
            return ctx.warning.warnOnIRNode(ParserDiagnostics.UNEXPECTED_IF_MODIFIER, ifAttribute, [
                modifier,
            ]);
        }

        element.if = ifAttribute.value;
        element.ifModifier = modifier;
    }
}

function applyLwcDirectives(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const lwcAttribute = parsedAttr.get(LWC_RE);
    if (!lwcAttribute) {
        return;
    }

    if (
        !LWC_DIRECTIVE_SET.has(lwcAttribute.name) &&
        !ROOT_TEMPLATE_DIRECTIVES_SET.has(lwcAttribute.name)
    ) {
        // unknown lwc directive
        return ctx.warning.warnOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            lwcAttribute.name,
            `<${element.tag}>`,
        ]);
    }

    const lwcOpts = {};
    applyLwcDynamicDirective(ctx, element, parsedAttr, lwcOpts);
    applyLwcDomDirective(ctx, element, parsedAttr, lwcOpts);
    applyLwcRenderModeDirective(ctx, element, parsedAttr, lwcOpts);
    applyLwcPreserveCommentsDirective(ctx, element, parsedAttr, lwcOpts);

    element.lwc = lwcOpts;
}

function applyLwcRenderModeDirective(
    ctx: ParserCtx,
    element: IRElement,
    parsedAttr: ParsedAttribute,
    lwcOpts: LWCDirectives
) {
    const lwcRenderModeAttribute = parsedAttr.get(ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE);
    if (!lwcRenderModeAttribute) {
        return;
    }

    if (
        lwcRenderModeAttribute.type !== IRAttributeType.String ||
        (lwcRenderModeAttribute.value !== 'shadow' && lwcRenderModeAttribute.value !== 'light')
    ) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.LWC_RENDER_MODE_INVALID_VALUE, element);
    }

    if (ctx.parentStack.length > 0) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE,
            `<${element.tag}>`,
        ]);
    }

    lwcOpts.renderMode = lwcRenderModeAttribute.value as LWCDirectiveRenderMode;
}

function applyLwcPreserveCommentsDirective(
    ctx: ParserCtx,
    element: IRElement,
    parsedAttr: ParsedAttribute,
    lwcOpts: LWCDirectives
) {
    const lwcPreserveCommentAttribute = parsedAttr.get(ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS);

    if (!lwcPreserveCommentAttribute) {
        return;
    }

    if (
        ctx.parentStack.length > 0 ||
        lwcPreserveCommentAttribute.type !== IRAttributeType.Boolean
    ) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE,
            `<${element.tag}>`,
        ]);
    }

    lwcOpts.preserveComments = lwcPreserveCommentAttribute;
}

function applyLwcDynamicDirective(
    ctx: ParserCtx,
    element: IRElement,
    parsedAttr: ParsedAttribute,
    lwcOpts: LWCDirectives
) {
    const { tag } = element;

    const lwcDynamicAttribute = parsedAttr.pick(LWC_DIRECTIVES.DYNAMIC);
    if (!lwcDynamicAttribute) {
        return;
    }

    if (!ctx.config.experimentalDynamicDirective) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.INVALID_OPTS_LWC_DYNAMIC, element, [
            `<${tag}>`,
        ]);
    }

    if (!isCustomElement(element)) {
        return ctx.warning.warnOnIRNode(
            ParserDiagnostics.INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT,
            element,
            [`<${tag}>`]
        );
    }

    if (lwcDynamicAttribute.type !== IRAttributeType.Expression) {
        return ctx.warning.warnOnIRNode(
            ParserDiagnostics.INVALID_LWC_DYNAMIC_LITERAL_PROP,
            element,
            [`<${tag}>`]
        );
    }

    lwcOpts.dynamic = lwcDynamicAttribute.value;
}

function applyLwcDomDirective(
    ctx: ParserCtx,
    element: IRElement,
    parsedAttr: ParsedAttribute,
    lwcOpts: LWCDirectives
) {
    const { tag } = element;

    const lwcDomAttribute = parsedAttr.pick(LWC_DIRECTIVES.DOM);
    if (!lwcDomAttribute) {
        return;
    }

    if (getRenderMode(ctx, element) === LWCDirectiveRenderMode.light) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_IN_LIGHT_DOM, element, [
            `<${tag}>`,
        ]);
    }

    if (isCustomElement(element)) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT, element, [
            `<${tag}>`,
        ]);
    }

    if (tag === 'slot') {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT, element);
    }

    if (
        lwcDomAttribute.type !== IRAttributeType.String ||
        hasOwnProperty.call(LWCDirectiveDomMode, lwcDomAttribute.value) === false
    ) {
        const possibleValues = Object.keys(LWCDirectiveDomMode)
            .map((value) => `"${value}"`)
            .join(', or ');
        return ctx.warning.warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element, [
            possibleValues,
        ]);
    }

    lwcOpts.dom = lwcDomAttribute.value as LWCDirectiveDomMode;
}

function applyForEach(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const forEachAttribute = parsedAttr.pick(FOR_DIRECTIVES.FOR_EACH);
    const forItemAttribute = parsedAttr.pick(FOR_DIRECTIVES.FOR_ITEM);
    const forIndex = parsedAttr.pick(FOR_DIRECTIVES.FOR_INDEX);

    if (forEachAttribute && forItemAttribute) {
        if (!isIRExpressionAttribute(forEachAttribute)) {
            ctx.warning.throwError(
                ParserDiagnostics.FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION,
                forEachAttribute.location
            );
        }

        if (!isIRStringAttribute(forItemAttribute)) {
            ctx.warning.throwError(
                ParserDiagnostics.FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING,
                forItemAttribute.location
            );
        }

        const item = getTemplateIdentifier(ctx, forItemAttribute.value, forItemAttribute.location);

        let index: TemplateIdentifier | undefined;
        if (forIndex) {
            if (!isIRStringAttribute(forIndex)) {
                ctx.warning.throwError(
                    ParserDiagnostics.FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING,
                    forIndex.location
                );
            }

            index = getTemplateIdentifier(ctx, forIndex.value, forIndex.location);
        }

        element.forEach = {
            expression: forEachAttribute.value,
            item,
            index,
        };
    } else if (forEachAttribute || forItemAttribute) {
        ctx.warning.throwError(
            ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
            element.location
        );
    }
}

function applyIterator(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const iteratorExpression = parsedAttr.pick(ITERATOR_RE);

    if (!iteratorExpression) {
        return;
    }

    if (element.forEach) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.INVALID_FOR_EACH_WITH_ITERATOR, element, [
            iteratorExpression.name,
        ]);
    }

    const iteratorAttributeName = iteratorExpression.name;
    const [, iteratorName] = iteratorAttributeName.split(':');

    if (iteratorExpression.type !== IRAttributeType.Expression) {
        return ctx.warning.warnOnIRNode(
            ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION,
            iteratorExpression,
            [iteratorExpression.name]
        );
    }

    let iterator: TemplateIdentifier;
    try {
        iterator = parseIdentifier(iteratorName);
    } catch (error) {
        return ctx.warning.warnOnError(
            ParserDiagnostics.IDENTIFIER_PARSING_ERROR,
            error,
            iteratorExpression.location
        );
    }

    element.forOf = {
        expression: iteratorExpression.value,
        iterator,
    };
}

function applyKey(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const { tag } = element;
    const keyAttribute = parsedAttr.pick('key');

    if (keyAttribute) {
        if (keyAttribute.type !== IRAttributeType.Expression) {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION,
                keyAttribute,
                []
            );
        }

        const forOfParent = getForOfParent(ctx.parentStack);
        const forEachParent = getForEachParent(element, ctx.parentStack);

        if (forOfParent) {
            if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent.forOf!)) {
                return ctx.warning.warnOnIRNode(
                    ParserDiagnostics.KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX,
                    keyAttribute,
                    [tag]
                );
            }
        } else if (forEachParent) {
            if (attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent.forEach!)) {
                const name = 'name' in keyAttribute.value && keyAttribute.value.name;
                return ctx.warning.warnOnIRNode(
                    ParserDiagnostics.KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX,
                    keyAttribute,
                    [tag, name]
                );
            }
        }

        element.forKey = keyAttribute.value;
    } else if (isIteratorElement(element, ctx.parentStack) && element.tag !== 'template') {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, element, [tag]);
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

function applySlot(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    // Early exit if the element is not a slot
    if (element.tag !== 'slot') {
        return;
    }

    if (element.forEach || element.forOf || element.if) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, element);
    }

    // Can't handle slots in applySlot because it would be too late for class and style attrs
    if (getRenderMode(ctx, element) === LWCDirectiveRenderMode.light) {
        const invalidAttrs = parsedAttr
            .getAttributes()
            .filter(({ name }) => name !== 'name')
            .map(({ name }) => name);

        if (invalidAttrs.length > 0) {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_ATTRIBUTES,
                element,
                [invalidAttrs.join(',')]
            );
        }
    }

    // Default slot have empty string name
    let name = '';

    const nameAttribute = parsedAttr.get('name');
    if (nameAttribute) {
        if (nameAttribute.type === IRAttributeType.Expression) {
            return ctx.warning.warnOnIRNode(
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

function isInIteration(ctx: ParserCtx, element: IRElement): boolean {
    let current: IRElement | undefined = element;

    for (let i = ctx.parentStack.length; i >= 0; i--) {
        if (current.tag === 'template') {
            if (current.forEach || current.forOf) {
                return true;
            }
        }

        current = ctx.parentStack[i - 1];
    }

    return false;
}

function applyAttributes(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const { tag } = element;
    const attributes = parsedAttr.getAttributes();

    for (const attr of attributes) {
        const name = attr.name;

        if (!isValidHTMLAttribute(tag, name)) {
            ctx.warning.warnOnIRNode(ParserDiagnostics.INVALID_HTML_ATTRIBUTE, attr, [name, tag]);
        }

        if (name.match(/[^a-z0-9]$/)) {
            ctx.warning.warnOnIRNode(
                ParserDiagnostics.ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER,
                attr,
                [name, tag]
            );
            return;
        }

        if (!/^-*[a-z]/.test(name)) {
            ctx.warning.warnOnIRNode(
                ParserDiagnostics.ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER,
                attr,
                [name, tag]
            );
            return;
        }

        // disallow attr name which combines underscore character with special character.
        // We normalize camel-cased names with underscores caMel -> ca-mel; thus sanitization.
        if (name.match(/_[^a-z0-9]|[^a-z0-9]_/)) {
            ctx.warning.warnOnIRNode(
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
                    ctx.warning.warnOnIRNode(ParserDiagnostics.INVALID_ID_ATTRIBUTE, attr, [value]);
                }

                if (isInIteration(ctx, element)) {
                    ctx.warning.warnOnIRNode(
                        ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION,
                        attr,
                        [value]
                    );
                }

                if (ctx.seenIds.has(value)) {
                    ctx.warning.warnOnIRNode(ParserDiagnostics.DUPLICATE_ID_FOUND, attr, [value]);
                } else {
                    ctx.seenIds.add(value);
                }
            }
        }

        // Prevent usage of the slot attribute with expression.
        if (name === 'slot' && attr.type === IRAttributeType.Expression) {
            return ctx.warning.warnOnIRNode(
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

            parsedAttr.pick(name);
        }
    }
}

function validateElement(ctx: ParserCtx, element: IRElement, node: parse5.Element) {
    const { tag, namespace, location } = element;
    const isRoot = ctx.parentStack.length === 0;

    if (isRoot) {
        if (tag !== 'template') {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE,
                element,
                [tag]
            );
        }

        const rootHasUnknownAttributes = node.attrs.some(
            ({ name }) => !ROOT_TEMPLATE_DIRECTIVES_SET.has(name)
        );
        if (rootHasUnknownAttributes) {
            return ctx.warning.warnOnIRNode(
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
    const isVoidElement = VOID_ELEMENT_SET.has(tag);
    if (!isVoidElement && !hasClosingTag && tag === tag.toLocaleLowerCase()) {
        ctx.warning.warnOnIRNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, element, [tag]);
    }

    if (tag === 'style' && namespace === HTML_NAMESPACE_URI) {
        ctx.warning.warnOnIRNode(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, element);
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
            ctx.warning.warnOnIRNode(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, element);
        }
    } else {
        const isNotAllowedHtmlTag = DISALLOWED_HTML_TAGS.has(tag);
        if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
            return ctx.warning.warnOnIRNode(ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE, element, [
                tag,
            ]);
        }

        const isNotAllowedSvgTag = !SUPPORTED_SVG_TAGS.has(tag);
        if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE,
                element,
                [tag]
            );
        }

        const isNotAllowedMathMlTag = DISALLOWED_MATHML_TAGS.has(tag);
        if (namespace === MATHML_NAMESPACE_URI && isNotAllowedMathMlTag) {
            return ctx.warning.warnOnIRNode(
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
            return ctx.warning.warnOnIRNode(
                ParserDiagnostics.UNKNOWN_HTML_TAG_IN_TEMPLATE,
                element,
                [tag]
            );
        }
    }
}

function validateChildren(ctx: ParserCtx, element: IRElement) {
    const effectiveChildren = getPreserveComments(ctx, element)
        ? element.children
        : element.children.filter((child) => child.type !== 'comment');
    if (element.lwc?.dom && effectiveChildren.length > 0) {
        return ctx.warning.warnOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element);
    }
}

function validateAttributes(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const { tag } = element;
    const attributes = parsedAttr.getAttributes();

    for (const attr of attributes) {
        const { name: attrName } = attr;

        if (isProhibitedIsAttribute(attrName)) {
            ctx.warning.warnOnIRNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element, [
                attrName,
                tag,
            ]);
        }

        if (isTabIndexAttribute(attrName)) {
            if (
                attr.type !== IRAttributeType.Expression &&
                !isValidTabIndexAttributeValue(attr.value)
            ) {
                ctx.warning.warnOnIRNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
            }
        }

        // TODO [#1136]: once the template compiler emits the element namespace information to the engine we should
        // restrict the validation of the "srcdoc" attribute on the "iframe" element only if this element is
        // part of the HTML namespace.
        if (tag === 'iframe' && attrName === 'srcdoc') {
            ctx.warning.warnOnIRNode(ParserDiagnostics.FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE, element);
        }
    }
}

function validateProperties(ctx: ParserCtx, element: IRElement) {
    const { tag, props } = element;

    if (props !== undefined) {
        for (const propName in props) {
            const { name: attrName, type, value } = props[propName];

            if (isProhibitedIsAttribute(attrName)) {
                ctx.warning.warnOnIRNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element, [
                    attrName,
                    tag,
                ]);
            }

            if (
                isTabIndexAttribute(attrName) &&
                type !== IRAttributeType.Expression &&
                !isValidTabIndexAttributeValue(value)
            ) {
                ctx.warning.warnOnIRNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
            }
        }
    }
}

function parseAttributes(
    ctx: ParserCtx,
    element: IRElement,
    node: parse5.Element
): ParsedAttribute {
    const parsedAttrs = new ParsedAttribute();
    const { attrs: attributes } = node;

    for (const attr of attributes) {
        const irAttr = getTemplateAttribute(ctx, element, attr);
        if (irAttr) {
            parsedAttrs.append(irAttr);
        }
    }

    return parsedAttrs;
}

function getTemplateAttribute(
    ctx: ParserCtx,
    element: IRElement,
    attribute: parse5.Attribute
): IRAttribute | undefined {
    const name = attributeName(attribute);

    // Convert attribute name to lowercase because the location map keys follow the algorithm defined in the spec
    // https://wicg.github.io/controls-list/html-output/multipage/syntax.html#attribute-name-state
    const location = element.location.attrs[name.toLowerCase()];
    const rawAttribute = ctx.getSource(location.startOffset, location.endOffset);

    const { tag } = element;

    // parse5 automatically converts the casing from camelcase to all lowercase. If the attribute name
    // is not the same before and after the parsing, then the attribute name contains capital letters
    if (!rawAttribute.startsWith(name)) {
        ctx.warning.warnAtLocation(
            ParserDiagnostics.INVALID_ATTRIBUTE_CASE,
            [rawAttribute, tag],
            location
        );
        return;
    }

    try {
        const isBooleanAttribute = !rawAttribute.includes('=');
        const { value, escapedExpression } = normalizeAttributeValue(attribute, rawAttribute, tag);
        if (isExpression(value) && !escapedExpression) {
            return {
                name,
                location,
                type: IRAttributeType.Expression,
                value: parseExpression(value, ctx.config),
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
        ctx.warning.warnOnError(ParserDiagnostics.GENERIC_PARSING_ERROR, error, location);
        // ctx.addDiagnostic(
        //     normalizeToDiagnostic(ParserDiagnostics.GENERIC_PARSING_ERROR, error, {
        //         location: ctx.normalizeLocation(location),
        //     })
        // );
    }
}

// Come back to this one, need to throw an error instead of returning here.
function getTemplateIdentifier(
    ctx: ParserCtx,
    source: string,
    location: parse5.Location
): TemplateIdentifier | never {
    try {
        return parseIdentifier(source);
    } catch (error) {
        ctx.warning.throwOnError(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, location);
    }
}

function getRoot(ctx: ParserCtx, element: IRElement): IRElement {
    return ctx.parentStack[0] || element;
}

function getRenderMode(ctx: ParserCtx, element: IRElement): LWCDirectiveRenderMode {
    return getRoot(ctx, element).lwc?.renderMode ?? LWCDirectiveRenderMode.shadow;
}

function getPreserveComments(ctx: ParserCtx, element: IRElement): boolean {
    return getRoot(ctx, element).lwc?.preserveComments?.value ?? ctx.config.preserveHtmlComments;
}
