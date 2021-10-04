/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { hasOwnProperty } from '@lwc/shared';

import { ParserDiagnostics } from '@lwc/errors';
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

import { isExpression, parseExpression, parseIdentifier } from './expression';

import * as t from '../shared-next/estree';
import * as parse5Utils from '../shared-next/parse5';
import {
    createComment,
    createComponent,
    createElement,
    createLiteral,
    createText,
    isCustomElement,
    isIRBooleanAttribute,
    isIRExpressionAttribute,
    isIRStringAttribute,
    isTemplate,
    parseSourceLocation,
    parseElementLocation,
    isExpressionAttribute,
    isStringAttribute,
} from '../shared-next/ir';
import {
    TemplateParseResult,
    Attribute,
    LWCNodeType,
    LWCDirectiveRenderMode,
    Element,
    Component,
    ForEach,
    Identifier,
    Literal,
    Expression,
    Iterator,
    IfBlock,
    Slot,
} from '../shared-next/types';

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
import { IRElement, IRNode, TemplateExpression } from '..';

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

    const root = ctx.withErrorRecovery(() => {
        const templateRoot = getTemplateRoot(ctx, fragment);
        return parseElement(ctx, templateRoot);
    });

    return { root, warnings: ctx.warnings };
}

function parseElement(ctx: ParserCtx, elementNode: parse5.Element): Element | Component {
    const parsedAttr = parseAttributes(ctx, elementNode);

    applyForEach(ctx, element, parsedAttr);
    applyIterator(ctx, element, parsedAttr);
    applyIf(ctx, element, parsedAttr);

    const element = parseElementType(elementNode);
    ctx.scope.addDeclaration(element);
    ctx.scope.current = element;

    applyHandlers(ctx, element, parsedAttr);
    // applySlot(ctx, element, parsedAttr);
    applyKey(ctx, element, parsedAttr);
    applyLwcDirectives(ctx, element, parsedAttr);
    applyAttributes(ctx, element, parsedAttr);

    validateElement(ctx, element, elementNode);
    validateAttributes(ctx, element, parsedAttr);
    validateProperties(ctx, element);

    parseChildren(ctx, element, elementNode);
    validateChildren(ctx, element);

    return element;
}

function parseElementType(parse5Elm: parse5.Element): Element | Component | Slot {
    const { tagName: tag } = parse5Elm;
    // Check if the element tag is a valid custom element name and is not part of known standard
    // element name containing a dash.
    if (!tag.includes('-') || DASHED_TAGNAME_ELEMENT_SET.has(tag)) {
        return createElement(parse5Elm);
    } else if (tag === 'slot') {
        return applySlot(ctx, parse5Elm, parsedAttr);
    }
    return createComponent(parse5Elm);
}

function parseChildren(ctx: ParserCtx, parent: IRElement, parse5Parent: parse5.Element): void {
    const parsedChildren: IRNode[] = [];
    const children = (parse5Utils.getTemplateContent(parse5Parent) ?? parse5Parent).childNodes;

    ctx.parentStack.push(parent);

    for (const child of children) {
        ctx.withErrorRecovery(() => {
            if (parse5Utils.isElementNode(child)) {
                const elmNode = parseElement(ctx, child);
                parsedChildren.push(elmNode);
            } else if (parse5Utils.isTextNode(child)) {
                const textNodes = parseText(ctx, child);
                parsedChildren.push(...textNodes);
            } else if (parse5Utils.isCommentNode(child)) {
                const commentNode = parseComment(child);
                parsedChildren.push(commentNode);
            }
        });
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

        let value: TemplateExpression | string;
        if (isExpression(token)) {
            value = parseExpression(ctx, token, location);
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
): parse5.Element {
    // Filter all the empty text nodes
    const validRoots = documentFragment.childNodes.filter(
        (child) =>
            parse5Utils.isElementNode(child) ||
            (parse5Utils.isTextNode(child) && child.value.trim().length)
    );

    if (validRoots.length > 1) {
        const duplicateRoot = validRoots[1].sourceCodeLocation!;
        ctx.throwAtLocation(ParserDiagnostics.MULTIPLE_ROOTS_FOUND, duplicateRoot);
    }

    const [root] = validRoots;

    if (!root || !parse5Utils.isElementNode(root)) {
        ctx.throwAtLocation(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
    }

    return root;
}

function applyHandlers(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    let eventHandlerAttribute;
    while ((eventHandlerAttribute = parsedAttr.pick(EVENT_HANDLER_RE))) {
        const { name } = eventHandlerAttribute;

        if (!isIRExpressionAttribute(eventHandlerAttribute)) {
            ctx.throwOnIRNode(
                ParserDiagnostics.EVENT_HANDLER_SHOULD_BE_EXPRESSION,
                eventHandlerAttribute
            );
        }

        if (!name.match(EVENT_HANDLER_NAME_RE)) {
            ctx.throwOnIRNode(ParserDiagnostics.INVALID_EVENT_NAME, eventHandlerAttribute, [name]);
        }

        // Strip the `on` prefix from the event handler name
        const eventName = name.slice(2);

        const on = element.on || (element.on = {});
        on[eventName] = eventHandlerAttribute.value;
    }
}

function applyIf(ctx: ParserCtx, parsedAttr: ParsedAttribute): IfBlock | undefined {
    const ifAttribute = parsedAttr.pick(IF_RE);
    if (!ifAttribute) {
        return;
    }

    if (!isExpressionAttribute(ifAttribute.value)) {
        ctx.throwOnIRNode(ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION, ifAttribute);
    }

    const [, modifier] = ifAttribute.name.split(':');
    if (!VALID_IF_MODIFIER.has(modifier)) {
        ctx.throwOnIRNode(ParserDiagnostics.UNEXPECTED_IF_MODIFIER, ifAttribute, [modifier]);
    }

    const ifNode: IfBlock = {
        type: LWCNodeType.IfBlock,
        location: ifAttribute.location,
        children: [],
        modifier,
        condition: ifAttribute.value,
    };

    ctx.scope.current?.children.push(ifNode);
    ctx.scope.addDeclaration(ifNode);
    ctx.scope.current = ifNode;
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
        ctx.throwOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
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
        !isIRStringAttribute(lwcRenderModeAttribute) ||
        (lwcRenderModeAttribute.value !== 'shadow' && lwcRenderModeAttribute.value !== 'light')
    ) {
        ctx.throwOnIRNode(ParserDiagnostics.LWC_RENDER_MODE_INVALID_VALUE, element);
    }

    if (ctx.parentStack.length > 0) {
        ctx.throwOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
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

    if (ctx.parentStack.length > 0 || !isIRBooleanAttribute(lwcPreserveCommentAttribute)) {
        ctx.throwOnIRNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
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
        ctx.throwOnIRNode(ParserDiagnostics.INVALID_OPTS_LWC_DYNAMIC, element, [`<${tag}>`]);
    }

    if (!isCustomElement(element)) {
        ctx.throwOnIRNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT, element, [
            `<${tag}>`,
        ]);
    }

    if (!isIRExpressionAttribute(lwcDynamicAttribute)) {
        ctx.throwOnIRNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_LITERAL_PROP, element, [
            `<${tag}>`,
        ]);
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

    if (ctx.getRenderMode(element) === LWCDirectiveRenderMode.light) {
        ctx.throwOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_IN_LIGHT_DOM, element, [`<${tag}>`]);
    }

    if (isCustomElement(element)) {
        ctx.throwOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT, element, [`<${tag}>`]);
    }

    if (tag === 'slot') {
        ctx.throwOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT, element);
    }

    if (
        !isIRStringAttribute(lwcDomAttribute) ||
        hasOwnProperty.call(LWCDirectiveDomMode, lwcDomAttribute.value) === false
    ) {
        const possibleValues = Object.keys(LWCDirectiveDomMode)
            .map((value) => `"${value}"`)
            .join(', or ');
        ctx.throwOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element, [possibleValues]);
    }

    lwcOpts.dom = lwcDomAttribute.value as LWCDirectiveDomMode;
}

function applyForEach(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const forEachAttribute = parsedAttr.pick(FOR_DIRECTIVES.FOR_EACH);
    const forItemAttribute = parsedAttr.pick(FOR_DIRECTIVES.FOR_ITEM);
    const forIndex = parsedAttr.pick(FOR_DIRECTIVES.FOR_INDEX);

    if (forEachAttribute && forItemAttribute) {
        if (!isExpressionAttribute(forEachAttribute.value)) {
            ctx.throwOnIRNode(
                ParserDiagnostics.FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION,
                forEachAttribute
            );
        }

        const forItemValue = forItemAttribute.value;
        if (!isStringAttribute(forItemValue)) {
            ctx.throwOnIRNode(
                ParserDiagnostics.FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING,
                forItemAttribute
            );
        }

        const item = parseIdentifier(ctx, forItemValue.value, forItemAttribute.location);

        let index: Identifier | undefined;
        if (forIndex) {
            const forIndexValue = forIndex.value;
            if (!isStringAttribute(forIndexValue)) {
                ctx.throwOnIRNode(ParserDiagnostics.FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING, forIndex);
            }

            index = parseIdentifier(ctx, forIndexValue.value, forIndex.location);
        }

        const forEach: ForEach = {
            type: LWCNodeType.ForEach,
            expression: forEachAttribute.value,
            location: forEachAttribute.location,
            children: [],
            item,
            index,
        };

        ctx.scope.addDeclaration(forEach);
        ctx.scope.current = forEach;
    } else if (forEachAttribute || forItemAttribute) {
        ctx.throwOnIRNode(
            ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
            element
        );
    }
}

function applyIterator(
    ctx: ParserCtx,
    element: IRElement,
    parsedAttr: ParsedAttribute
): Iterator | undefined {
    const iteratorExpression = parsedAttr.pick(ITERATOR_RE);
    if (!iteratorExpression) {
        return;
    }

    if (ctx.scope.has(LWCNodeType.ForEach)) {
        ctx.throwOnIRNode(ParserDiagnostics.INVALID_FOR_EACH_WITH_ITERATOR, element, [
            iteratorExpression.name,
        ]);
    }

    const iteratorAttributeName = iteratorExpression.name;
    const [, iteratorName] = iteratorAttributeName.split(':');

    if (!isExpressionAttribute(iteratorExpression.value)) {
        ctx.throwOnIRNode(ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION, iteratorExpression, [
            iteratorExpression.name,
        ]);
    }

    const iterator = parseIdentifier(ctx, iteratorName, iteratorExpression.location);

    const it: Iterator = {
        type: LWCNodeType.Iterator,
        expression: iteratorExpression.value,
        iterator,
        location: iteratorExpression.location,
        children: [],
    };
    ctx.scope.addDeclaration(it);
    ctx.scope.current = it;
}

function applyKey(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const { tag } = element;
    const keyAttribute = parsedAttr.pick('key');

    if (keyAttribute) {
        if (!isIRExpressionAttribute(keyAttribute)) {
            ctx.throwOnIRNode(ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION, keyAttribute);
        }

        const forOfParent = getForOfParent(ctx);
        const forEachParent = getForEachParent(ctx, element);

        if (forOfParent) {
            if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent.forOf!)) {
                ctx.throwOnIRNode(
                    ParserDiagnostics.KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX,
                    keyAttribute,
                    [tag]
                );
            }
        } else if (forEachParent) {
            if (attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent.forEach!)) {
                const name = 'name' in keyAttribute.value && keyAttribute.value.name;
                ctx.throwOnIRNode(
                    ParserDiagnostics.KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX,
                    keyAttribute,
                    [tag, name]
                );
            }
        }

        element.forKey = keyAttribute.value;
    } else if (isInIteratorElement(ctx, element) && !isTemplate(element)) {
        ctx.throwOnIRNode(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, element, [tag]);
    }
}

function applySlot(ctx: ParserCtx, parse5Elm: parse5.Element, parsedAttr: ParsedAttribute): Slot {
    // if (element.forEach || element.forOf || element.if) {
    if (
        ctx.scope.has(LWCNodeType.ForEach) ||
        ctx.scope.has(LWCNodeType.Iterator) ||
        ctx.scope.has(LWCNodeType.IfBlock)
    ) {
        ctx.throwOnIRNode(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, element);
    }

    // Can't handle slots in applySlot because it would be too late for class and style attrs
    if (ctx.getRenderMode(element) === LWCDirectiveRenderMode.Light) {
        const invalidAttrs = parsedAttr
            .getAttributes()
            .filter(({ name }) => name !== 'name')
            .map(({ name }) => name);

        if (invalidAttrs.length > 0) {
            ctx.throwOnIRNode(ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_ATTRIBUTES, element, [
                invalidAttrs.join(','),
            ]);
        }
    }

    // Default slot have empty string name
    let name = '';

    const nameAttribute = parsedAttr.get('name');
    if (nameAttribute) {
        if (isExpressionAttribute(nameAttribute.value)) {
            ctx.throwOnIRNode(ParserDiagnostics.NAME_ON_SLOT_CANNOT_BE_EXPRESSION, nameAttribute);
        } else if (isStringAttribute(nameAttribute.value)) {
            name = nameAttribute.value.value;
        }
    }

    const alreadySeen = ctx.seenSlots.has(name);
    ctx.seenSlots.add(name);

    if (alreadySeen) {
        ctx.warnOnIRNode(ParserDiagnostics.NO_DUPLICATE_SLOTS, element, [
            name === '' ? 'default' : `name="${name}"`,
        ]);
    } else if (isInIteration(ctx, element)) {
        ctx.warnOnIRNode(ParserDiagnostics.NO_SLOTS_IN_ITERATOR, element, [
            name === '' ? 'default' : `name="${name}"`,
        ]);
    }

    const location = parseElementLocation(original);
    return {
        type: LWCNodeType.Slot,
        name,
        attributes: [],
        listeners: [],
        children: [],
        location: parseSourceLocation(location),
    };
}

function applyAttributes(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const { tag } = element;
    const attributes = parsedAttr.getAttributes();

    for (const attr of attributes) {
        const { name } = attr;

        if (!isValidHTMLAttribute(tag, name)) {
            ctx.warnOnIRNode(ParserDiagnostics.INVALID_HTML_ATTRIBUTE, attr, [name, tag]);
        }

        if (name.match(/[^a-z0-9]$/)) {
            ctx.throwOnIRNode(
                ParserDiagnostics.ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER,
                attr,
                [name, tag]
            );
        }

        if (!/^-*[a-z]/.test(name)) {
            ctx.throwOnIRNode(
                ParserDiagnostics.ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER,
                attr,
                [name, tag]
            );
        }

        // disallow attr name which combines underscore character with special character.
        // We normalize camel-cased names with underscores caMel -> ca-mel; thus sanitization.
        if (name.match(/_[^a-z0-9]|[^a-z0-9]_/)) {
            ctx.throwOnIRNode(
                ParserDiagnostics.ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS,
                attr,
                [name, tag]
            );
        }

        if (isIRStringAttribute(attr)) {
            if (name === 'id') {
                const { value } = attr;

                if (/\s+/.test(value)) {
                    ctx.throwOnIRNode(ParserDiagnostics.INVALID_ID_ATTRIBUTE, attr, [value]);
                }

                if (isInIteration(ctx, element)) {
                    ctx.throwOnIRNode(ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION, attr, [
                        value,
                    ]);
                }

                if (ctx.seenIds.has(value)) {
                    ctx.throwOnIRNode(ParserDiagnostics.DUPLICATE_ID_FOUND, attr, [value]);
                } else {
                    ctx.seenIds.add(value);
                }
            }
        }

        // Prevent usage of the slot attribute with expression.
        if (name === 'slot' && isIRExpressionAttribute(attr)) {
            ctx.throwOnIRNode(ParserDiagnostics.SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION, attr);
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
        if (!isTemplate(element)) {
            ctx.throwOnIRNode(ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE, element, [tag]);
        }

        const rootHasUnknownAttributes = node.attrs.some(
            ({ name }) => !ROOT_TEMPLATE_DIRECTIVES_SET.has(name)
        );
        if (rootHasUnknownAttributes) {
            ctx.throwOnIRNode(ParserDiagnostics.ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES, element);
        }
    }

    // Check if a non-void element has a matching closing tag.
    //
    // Note: Parse5 currently fails to collect end tag location for element with a tag name
    // containing an upper case character (inikulin/parse5#352).
    const hasClosingTag = Boolean(location.endTag);
    const isVoidElement = VOID_ELEMENT_SET.has(tag);
    if (!isVoidElement && !hasClosingTag && tag === tag.toLocaleLowerCase()) {
        ctx.throwOnIRNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, element, [tag]);
    }

    if (tag === 'style' && namespace === HTML_NAMESPACE_URI) {
        ctx.throwOnIRNode(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, element);
    } else if (isTemplate(element)) {
        // We check if the template element has some modifier applied to it. Directly checking if one of the
        // IRElement property is impossible. For example when an error occurs during the parsing of the if
        // expression, the `element.if` property remains undefined. It would results in 2 warnings instead of 1:
        //      - Invalid if expression
        //      - Unexpected template element
        //
        // Checking if the original HTMLElement has some attributes applied is a good enough for now.
        const hasAttributes = node.attrs.length !== 0;
        if (!isRoot && !hasAttributes) {
            ctx.throwOnIRNode(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, element);
        }
    } else {
        const isNotAllowedHtmlTag = DISALLOWED_HTML_TAGS.has(tag);
        if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
            ctx.throwOnIRNode(ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE, element, [tag]);
        }

        const isNotAllowedSvgTag = !SUPPORTED_SVG_TAGS.has(tag);
        if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
            ctx.throwOnIRNode(ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE, element, [
                tag,
            ]);
        }

        const isNotAllowedMathMlTag = DISALLOWED_MATHML_TAGS.has(tag);
        if (namespace === MATHML_NAMESPACE_URI && isNotAllowedMathMlTag) {
            ctx.throwOnIRNode(ParserDiagnostics.FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE, element, [
                tag,
            ]);
        }

        const isKnownTag =
            isCustomElement(element) ||
            KNOWN_HTML_ELEMENTS.has(tag) ||
            SUPPORTED_SVG_TAGS.has(tag) ||
            DASHED_TAGNAME_ELEMENT_SET.has(tag);

        if (!isKnownTag) {
            ctx.warnOnIRNode(ParserDiagnostics.UNKNOWN_HTML_TAG_IN_TEMPLATE, element, [tag]);
        }
    }
}

function validateChildren(ctx: ParserCtx, element: IRElement) {
    const effectiveChildren = ctx.getPreserveComments(element)
        ? element.children
        : element.children.filter((child) => child.type !== 'comment');
    if (element.lwc?.dom && effectiveChildren.length > 0) {
        ctx.throwOnIRNode(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element);
    }
}

function validateAttributes(ctx: ParserCtx, element: IRElement, parsedAttr: ParsedAttribute) {
    const { tag } = element;
    const attributes = parsedAttr.getAttributes();

    for (const attr of attributes) {
        const { name: attrName } = attr;

        if (isProhibitedIsAttribute(attrName)) {
            ctx.throwOnIRNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element, [
                attrName,
                tag,
            ]);
        }

        if (isTabIndexAttribute(attrName)) {
            if (!isIRExpressionAttribute(attr) && !isValidTabIndexAttributeValue(attr.value)) {
                ctx.throwOnIRNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
            }
        }

        // TODO [#1136]: once the template compiler emits the element namespace information to the engine we should
        // restrict the validation of the "srcdoc" attribute on the "iframe" element only if this element is
        // part of the HTML namespace.
        if (tag === 'iframe' && attrName === 'srcdoc') {
            ctx.throwOnIRNode(ParserDiagnostics.FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE, element);
        }
    }
}

function validateProperties(ctx: ParserCtx, element: IRElement) {
    const { tag, props } = element;

    if (props !== undefined) {
        for (const propName in props) {
            const propAttr = props[propName];
            const { name: attrName, value } = propAttr;

            if (isProhibitedIsAttribute(attrName)) {
                ctx.throwOnIRNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element, [
                    attrName,
                    tag,
                ]);
            }

            if (
                isTabIndexAttribute(attrName) &&
                !isIRExpressionAttribute(propAttr) &&
                !isValidTabIndexAttributeValue(value)
            ) {
                ctx.throwOnIRNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
            }
        }
    }
}

function parseAttributes(ctx: ParserCtx, node: parse5.Element): ParsedAttribute {
    const parsedAttrs = new ParsedAttribute();
    const { attrs: attributes, tagName } = node;
    const { attrs: attrLocations } = parseElementLocation(node);

    for (const attr of attributes) {
        parsedAttrs.append(getTemplateAttribute(ctx, tagName, attrLocations, attr));
    }

    return parsedAttrs;
}

function getTemplateAttribute(
    ctx: ParserCtx,
    tag: string,
    attrLocations: parse5.AttributesLocation,
    attribute: parse5.Attribute
): Attribute {
    const name = attributeName(attribute);

    // Convert attribute name to lowercase because the location map keys follow the algorithm defined in the spec
    // https://wicg.github.io/controls-list/html-output/multipage/syntax.html#attribute-name-state
    const rawLocation = attrLocations[name.toLowerCase()];
    const rawAttribute = ctx.getSource(rawLocation.startOffset, rawLocation.endOffset);

    // parse5 automatically converts the casing from camelcase to all lowercase. If the attribute name
    // is not the same before and after the parsing, then the attribute name contains capital letters
    if (!rawAttribute.startsWith(name)) {
        ctx.throwAtLocation(ParserDiagnostics.INVALID_ATTRIBUTE_CASE, rawLocation, [
            rawAttribute,
            tag,
        ]);
    }

    const isBooleanAttribute = !rawAttribute.includes('=');
    const location = parseSourceLocation(rawLocation);
    const { value, escapedExpression } = normalizeAttributeValue(
        ctx,
        rawAttribute,
        tag,
        attribute,
        rawLocation
    );

    let attrValue: Literal | Expression;
    if (isExpression(value) && !escapedExpression) {
        // expression
        attrValue = parseExpression(ctx, value, rawLocation);
    } else if (isBooleanAttribute) {
        // boolean
        attrValue = createLiteral(true);
    } else {
        //string
        attrValue = createLiteral(value);
    }

    return {
        name,
        location,
        type: LWCNodeType.Attribute,
        value: attrValue,
    };
}

function isInIteration(ctx: ParserCtx, element: IRElement) {
    return ctx.findAncestor({
        predicate: (element) => isTemplate(element) && (element.forOf || element.forEach),
        element,
    });
}

function getForOfParent(ctx: ParserCtx): IRElement | null {
    return ctx.findAncestor({
        predicate: (element) => element.forOf,
        traversalCond: ({ current }) => isTemplate(current),
    });
}

function getForEachParent(ctx: ParserCtx, element: IRElement): IRElement | null {
    return ctx.findAncestor({
        element,
        predicate: (element) => element.forEach,
        traversalCond: ({ parent }) => parent && isTemplate(parent),
    });
}

function isInIteratorElement(ctx: ParserCtx, element: IRElement): boolean {
    return !!(getForOfParent(ctx) || getForEachParent(ctx, element));
}
