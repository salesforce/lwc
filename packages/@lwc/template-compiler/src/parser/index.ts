/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
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
    parseTagName,
    propertyToAttributeName,
} from './attribute';

import { isExpression, parseExpression, parseIdentifier } from './expression';

import * as t from '../shared/estree';
import * as parse5Utils from '../shared/parse5';
import * as ast from '../shared/ast';
import {
    TemplateParseResult,
    Attribute,
    Element,
    Component,
    ForEach,
    Identifier,
    Literal,
    Expression,
    ForOf,
    Slot,
    Text,
    Root,
    SourceLocation,
    ParentNode,
    BaseElement,
    Comment,
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
import { LWC_RENDERMODE } from '../shared/constants';

function attributeExpressionReferencesForOfIndex(attribute: Attribute, forOf: ForOf): boolean {
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
    attribute: Attribute,
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
        return parseRoot(ctx, templateRoot);
    });

    return { root, warnings: ctx.warnings };
}

function parseRoot(ctx: ParserCtx, parse5Elm: parse5.Element): Root {
    const parsedAttr = parseAttributes(ctx, parse5Elm);
    const location = parseSourceLocation(ctx, parse5Elm);
    const root = ast.root(parse5Elm, location);

    applyRootLwcDirectives(ctx, root, parsedAttr);
    ctx.setRootDirective(root);
    validateRoot(ctx, root, parse5Elm);
    parseChildren(ctx, root, parse5Elm);

    return root;
}

function parseElement(ctx: ParserCtx, parse5Elm: parse5.Element, parse5Parent: parse5.Element, parent: ParentNode): void {
    const parsedAttr = parseAttributes(ctx, parse5Elm);
    const directive = parseElementDirectives(ctx, parse5Elm, parsedAttr, parent);
    const element = parseElementType(ctx, parse5Elm, parsedAttr, directive, parse5Parent);

    if (element) {
        applyHandlers(ctx, element, parsedAttr);
        applyKey(ctx, element, parsedAttr, parent);
        applyLwcDirectives(ctx, element, parsedAttr);
        applyAttributes(ctx, element, parsedAttr);

        validateElement(ctx, element, parse5Elm);
        validateAttributes(ctx, element, parsedAttr);
        validateProperties(ctx, element);
    }

    validateTemplate(ctx, parse5Elm);
    parseChildren(ctx, element || directive, parse5Elm);
    validateChildren(ctx, element);
}

function parseElementDirectives(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parsedAttr: ParsedAttribute,
    parent: ParentNode
) {
    let current = parent;

    const parsers = [parseForEach, parseIterator, parseIf];
    for (const parser of parsers) {
        // Currently, parseIterator is the only parser that requires the previous node.
        // If the parent node is a ForEach, do not pass it to parseIterator.  This will
        // avoid a false positive on the INVALID_FOR_EACH_WITH_ITERATOR error.
        const prev = current !== parent ? current : undefined;
        const node = parser(ctx, parse5Elm, parsedAttr, prev);
        if (node) {
            ctx.addParent(node);
            current.children.push(node);
            current = node;
        }
    }

    return current;
}

function parseElementType(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parsedAttr: ParsedAttribute,
    parent: ParentNode, 
    parse5Parent: parse5.Element
) {
    const { tagName: tag } = parse5Elm;
    const location = parseSourceLocation(ctx, parse5Elm, parse5Parent);
    // Check if the element tag is a valid custom element name and is not part of known standard
    // element name containing a dash.
    let element: Element | Component | Slot | undefined;
    if (tag === 'slot') {
        element = parseSlot(ctx, location, parsedAttr, parent);
    } else if (tag !== 'template' && (!tag.includes('-') || DASHED_TAGNAME_ELEMENT_SET.has(tag))) {
        element = ast.element(parse5Elm, location);
    } else if (tag !== 'template') {
        element = ast.component(parse5Elm, location);
    }

    if (element) {
        parent.children.push(element);
        ctx.addParent(element);
    }

    return element;
}

function parseSourceLocation(ctx: ParserCtx, parse5Elm: parse5.Element, parse5Parent?: parse5.Element): SourceLocation {
    const parse5ElmLocation = parseElementLocation(ctx, parse5Elm, parse5Parent);
    return ast.sourceLocation(parse5ElmLocation);
}

function parseElementLocation(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parse5Parent?: parse5.Element
): parse5.ElementLocation | undefined {
    let location = parse5Elm.sourceCodeLocation;

    if (!location) {
        // Parse5 will recover from invalid HTML. When this happens the element's sourceCodeLocation will be undefined.
        // https://github.com/inikulin/parse5/blob/master/packages/parse5/docs/options/parser-options.md#sourcecodelocationinfo
        ctx.warn(ParserDiagnostics.INVALID_HTML_RECOVERY, [
            parse5Elm.tagName,
            parse5Parent?.tagName,
        ]);
    }

    // With parse5 automatically recovering from invalid HTML, some AST nodes might not have
    // location information. For example when a <table> element has a <tr> child element, parse5
    // creates a <tbody> element in the middle without location information. In this case, we
    // can safely skip the closing tag validation.
    let current = parse5Elm;

    while (!location && parse5Utils.isElementNode(current.parentNode)) {
        current = current.parentNode;
        location = current.sourceCodeLocation;
    }

    // Parent's location is used as the fallback in case the current node's location cannot be found.
    // If there is no parent, use an empty parse5.ElementLocation instead.
    return location ?? parse5Parent?.sourceCodeLocation;
}

function parseChildren(ctx: ParserCtx, parent: ParentNode, parse5Parent: parse5.Element): void {
    const children = (parse5Utils.getTemplateContent(parse5Parent) ?? parse5Parent).childNodes;

    for (const child of children) {
        ctx.withErrorRecovery(() => {
            if (parse5Utils.isElementNode(child)) {
                ctx.beginAncestors();
                parseElement(ctx, child, parse5Parent, parent);
                ctx.endAncestors();
            } else if (parse5Utils.isTextNode(child)) {
                const textNodes = parseText(ctx, child);
                parent.children.push(...textNodes);
            } else if (parse5Utils.isCommentNode(child)) {
                const commentNode = parseComment(child);
                parent.children.push(commentNode);
            }
        });
    }
}

function parseText(ctx: ParserCtx, parse5Text: parse5.TextNode): Text[] {
    const parsedTextNodes: Text[] = [];
    const location = parse5Text.sourceCodeLocation;

    if (!location) {
        // Parse5 will recover from invalid HTML. When this happens the node's sourceCodeLocation will be undefined.
        // https://github.com/inikulin/parse5/blob/master/packages/parse5/docs/options/parser-options.md#sourcecodelocationinfo
        // This is a defensive check as this should never happen for TextNode.
        throw new Error(
            `An internal parsing error occurred during node creation; a text node was found without a sourceCodeLocation.`
        );
    }

    // Extract the raw source to avoid HTML entity decoding done by parse5
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

        let value: Expression | Literal;
        if (isExpression(token)) {
            value = parseExpression(ctx, token, ast.sourceLocation(location));
        } else {
            value = ast.literal(decodeTextContent(token));
        }

        parsedTextNodes.push(ast.text(value, location));
    }

    return parsedTextNodes;
}

function parseComment(parse5Comment: parse5.CommentNode): Comment {
    const location = parse5Comment.sourceCodeLocation;

    if (!location) {
        // Parse5 will recover from invalid HTML. When this happens the node's sourceCodeLocation will be undefined.
        // https://github.com/inikulin/parse5/blob/master/packages/parse5/docs/options/parser-options.md#sourcecodelocationinfo
        // This is a defensive check as this should never happen for CommentNode.
        throw new Error(
            `An internal parsing error occurred during node creation; a comment node was found without a sourceCodeLocation.`
        );
    }

    return ast.comment(decodeTextContent(parse5Comment.data), location);
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
        ctx.throwAtLocation(
            ParserDiagnostics.MULTIPLE_ROOTS_FOUND,
            ast.sourceLocation(duplicateRoot)
        );
    }

    const [root] = validRoots;

    if (!root || !parse5Utils.isElementNode(root)) {
        ctx.throw(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
    }

    return root;
}

function applyHandlers(
    ctx: ParserCtx,
    element: Component | Element | Slot,
    parsedAttr: ParsedAttribute
) {
    let eventHandlerAttribute;
    while ((eventHandlerAttribute = parsedAttr.pick(EVENT_HANDLER_RE))) {
        const { name } = eventHandlerAttribute;

        if (!ast.isExpression(eventHandlerAttribute.value)) {
            ctx.throwOnNode(
                ParserDiagnostics.EVENT_HANDLER_SHOULD_BE_EXPRESSION,
                eventHandlerAttribute
            );
        }

        if (!name.match(EVENT_HANDLER_NAME_RE)) {
            ctx.throwOnNode(ParserDiagnostics.INVALID_EVENT_NAME, eventHandlerAttribute, [name]);
        }

        // Strip the `on` prefix from the event handler name
        const eventName = name.slice(2);
        const listener = ast.eventListener(
            eventName,
            eventHandlerAttribute.value,
            eventHandlerAttribute.location
        );
        element.listeners.push(listener);
    }
}

function parseIf(ctx: ParserCtx, parse5Elm: parse5.Element, parsedAttr: ParsedAttribute) {
    const ifAttribute = parsedAttr.pick(IF_RE);
    if (!ifAttribute) {
        return;
    }

    if (!ast.isExpression(ifAttribute.value)) {
        ctx.throwOnNode(ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION, ifAttribute);
    }

    const [, modifier] = ifAttribute.name.split(':');
    if (!VALID_IF_MODIFIER.has(modifier)) {
        ctx.throwOnNode(ParserDiagnostics.UNEXPECTED_IF_MODIFIER, ifAttribute, [modifier]);
    }

    return ast.ifBlock(ifAttribute.location, modifier, ifAttribute.value);
}

function applyRootLwcDirectives(ctx: ParserCtx, root: Root, parsedAttr: ParsedAttribute) {
    const lwcAttribute = parsedAttr.get(LWC_RE);
    if (!lwcAttribute) {
        return;
    }

    if (
        !LWC_DIRECTIVE_SET.has(lwcAttribute.name) &&
        !ROOT_TEMPLATE_DIRECTIVES_SET.has(lwcAttribute.name)
    ) {
        ctx.throwOnNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, root, [
            lwcAttribute.name,
            `<template>`,
        ]);
    }

    applyLwcRenderModeDirective(ctx, root, parsedAttr);
    applyLwcPreserveCommentsDirective(ctx, root, parsedAttr);
}

function applyLwcRenderModeDirective(ctx: ParserCtx, root: Root, parsedAttr: ParsedAttribute) {
    const lwcRenderModeAttribute = parsedAttr.get(ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE);
    if (!lwcRenderModeAttribute) {
        return;
    }

    const { value: renderDomAttr } = lwcRenderModeAttribute;

    if (
        !ast.isStringLiteral(renderDomAttr) ||
        (renderDomAttr.value !== 'shadow' && renderDomAttr.value !== 'light')
    ) {
        ctx.throwOnNode(ParserDiagnostics.LWC_RENDER_MODE_INVALID_VALUE, root);
    }

    const value = ast.renderModeDirective(renderDomAttr.value, lwcRenderModeAttribute.location);
    const directives = root.directives || (root.directives = []);
    directives.push(value);
}

function applyLwcPreserveCommentsDirective(
    ctx: ParserCtx,
    root: Root,
    parsedAttr: ParsedAttribute
) {
    const lwcPreserveCommentAttribute = parsedAttr.get(ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS);
    if (!lwcPreserveCommentAttribute) {
        return;
    }

    const { value: lwcPreserveCommentsAttr } = lwcPreserveCommentAttribute;

    if (!ast.isBooleanLiteral(lwcPreserveCommentsAttr)) {
        ctx.throwOnNode(ParserDiagnostics.PRESERVE_COMMENTS_MUST_BE_BOOLEAN, root);
    }

    const value = ast.preserveCommentsDirective(
        lwcPreserveCommentsAttr.value,
        lwcPreserveCommentAttribute.location
    );
    const directives = root.directives || (root.directives = []);
    directives.push(value);
}

function applyLwcDirectives(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parsedAttr: ParsedAttribute
) {
    const lwcAttribute = parsedAttr.get(LWC_RE);
    if (!lwcAttribute) {
        return;
    }

    if (
        !LWC_DIRECTIVE_SET.has(lwcAttribute.name) &&
        !ROOT_TEMPLATE_DIRECTIVES_SET.has(lwcAttribute.name)
    ) {
        ctx.throwOnNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            lwcAttribute.name,
            `<${element.name}>`,
        ]);
    }

    // Should not allow render mode or preserve comments on non root nodes
    if (parsedAttr.get(ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE)) {
        ctx.throwOnNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE,
            `<${element.name}>`,
        ]);
    }

    if (parsedAttr.get(ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS)) {
        ctx.throwOnNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS,
            `<${element.name}>`,
        ]);
    }

    applyLwcDynamicDirective(ctx, element, parsedAttr);
    applyLwcDomDirective(ctx, element, parsedAttr);
    applyLwcInnerHtmlDirective(ctx, element, parsedAttr);
}

function applyLwcInnerHtmlDirective(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parsedAttr: ParsedAttribute
) {
    const lwcInnerHtmlDirective = parsedAttr.pick(LWC_DIRECTIVES.INNER_HTML);

    if (!lwcInnerHtmlDirective) {
        return;
    }

    if (ast.isComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_INNER_HTML_INVALID_CUSTOM_ELEMENT, element, [
            `<${element.name}>`,
        ]);
    }

    if (element.name === 'slot' || element.name === 'template') {
        ctx.throwOnNode(ParserDiagnostics.LWC_INNER_HTML_INVALID_ELEMENT, element, [
            `<${element.name}>`,
        ]);
    }

    const { value: innerHTMLVal } = lwcInnerHtmlDirective;

    if (!ast.isStringLiteral(innerHTMLVal) && !ast.isExpression(innerHTMLVal)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_INNER_HTML_INVALID_VALUE, element, [
            `<${element.name}>`,
        ]);
    }

    const directives = element.directives || (element.directives = []);
    directives.push(ast.innerHTMLDirective(innerHTMLVal, lwcInnerHtmlDirective.location));
}

function applyLwcDynamicDirective(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parsedAttr: ParsedAttribute
) {
    const tag = parseTagName(element);

    const lwcDynamicAttribute = parsedAttr.pick(LWC_DIRECTIVES.DYNAMIC);
    if (!lwcDynamicAttribute) {
        return;
    }

    if (!ctx.config.experimentalDynamicDirective) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_OPTS_LWC_DYNAMIC, element);
    }

    if (!ast.isComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT, element, [
            `<${tag}>`,
        ]);
    }

    const { value: lwcDynamicAttr } = lwcDynamicAttribute;
    if (!ast.isExpression(lwcDynamicAttr)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_LITERAL_PROP, element, [`<${tag}>`]);
    }

    const directives = element.directives || (element.directives = []);
    directives.push(ast.dynamicDirective(lwcDynamicAttr, lwcDynamicAttr.location));
}

function applyLwcDomDirective(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parsedAttr: ParsedAttribute
) {
    const tag = parseTagName(element);

    const lwcDomAttribute = parsedAttr.pick(LWC_DIRECTIVES.DOM);
    if (!lwcDomAttribute) {
        return;
    }

    if (ctx.renderMode === LWC_RENDERMODE.LIGHT) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_IN_LIGHT_DOM, element, [`<${tag}>`]);
    }

    if (ast.isComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT, element, [`<${tag}>`]);
    }

    if (ast.isSlot(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT, element);
    }

    const { value: lwcDomAttr } = lwcDomAttribute;

    if (!ast.isStringLiteral(lwcDomAttr) || lwcDomAttr.value !== 'manual') {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element, [`"manual"`]);
    }

    const directives = element.directives || (element.directives = []);
    directives.push(ast.domDirective(lwcDomAttr.value, lwcDomAttribute.location));
}

function parseForEach(ctx: ParserCtx, parse5Elm: parse5.Element, parsedAttr: ParsedAttribute) {
    const forEachAttribute = parsedAttr.pick(FOR_DIRECTIVES.FOR_EACH);
    const forItemAttribute = parsedAttr.pick(FOR_DIRECTIVES.FOR_ITEM);
    const forIndex = parsedAttr.pick(FOR_DIRECTIVES.FOR_INDEX);

    if (forEachAttribute && forItemAttribute) {
        if (!ast.isExpression(forEachAttribute.value)) {
            ctx.throwOnNode(
                ParserDiagnostics.FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION,
                forEachAttribute
            );
        }

        const forItemValue = forItemAttribute.value;
        if (!ast.isStringLiteral(forItemValue)) {
            ctx.throwOnNode(
                ParserDiagnostics.FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING,
                forItemAttribute
            );
        }

        const item = parseIdentifier(ctx, forItemValue.value, forItemAttribute.location);

        let index: Identifier | undefined;
        if (forIndex) {
            const forIndexValue = forIndex.value;
            if (!ast.isStringLiteral(forIndexValue)) {
                ctx.throwOnNode(ParserDiagnostics.FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING, forIndex);
            }

            index = parseIdentifier(ctx, forIndexValue.value, forIndex.location);
        }
        return ast.forEach(forEachAttribute.value, forEachAttribute.location, item, index);
    } else if (forEachAttribute || forItemAttribute) {
        const location = parseSourceLocation(ctx, parse5Elm);
        ctx.throwAtLocation(
            ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
            location
        );
    }
}

function parseIterator(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parsedAttr: ParsedAttribute,
    current?: ParentNode
) {
    const iteratorExpression = parsedAttr.pick(ITERATOR_RE);
    if (!iteratorExpression) {
        return;
    }

    if (current && ast.isForEach(current)) {
        const location = parseSourceLocation(ctx, parse5Elm);
        ctx.throwAtLocation(ParserDiagnostics.INVALID_FOR_EACH_WITH_ITERATOR, location, [
            iteratorExpression.name,
        ]);
    }

    const iteratorAttributeName = iteratorExpression.name;
    const [, iteratorName] = iteratorAttributeName.split(':');

    if (!ast.isExpression(iteratorExpression.value)) {
        ctx.throwOnNode(ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION, iteratorExpression, [
            iteratorExpression.name,
        ]);
    }

    const iterator = parseIdentifier(ctx, iteratorName, iteratorExpression.location);

    return ast.forOf(iteratorExpression.value, iterator, iteratorExpression.location);
}

function applyKey(
    ctx: ParserCtx,
    element: Component | Element | Slot,
    parsedAttr: ParsedAttribute,
    parent: ParentNode
) {
    const tag = parseTagName(element);
    const keyAttribute = parsedAttr.pick('key');

    if (keyAttribute) {
        if (!ast.isExpression(keyAttribute.value)) {
            ctx.throwOnNode(ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION, keyAttribute);
        }

        const forOfParent = getForOfParent(ctx, parent);
        const forEachParent = getForEachParent(ctx);

        if (forOfParent) {
            if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent)) {
                ctx.throwOnNode(
                    ParserDiagnostics.KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX,
                    keyAttribute,
                    [tag]
                );
            }
        } else if (forEachParent) {
            if (attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent)) {
                const name = 'name' in keyAttribute.value && keyAttribute.value.name;
                ctx.throwOnNode(
                    ParserDiagnostics.KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX,
                    keyAttribute,
                    [tag, name]
                );
            }
        }

        const forKey = ast.keyDirective(keyAttribute.value, keyAttribute.location);
        const directive = element.directives || (element.directives = []);
        directive.push(forKey);
    } else if (isInIteratorElement(ctx, parent)) {
        ctx.throwOnNode(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, element, [tag]);
    }
}

function parseSlot(
    ctx: ParserCtx,
    elementLocation: SourceLocation,
    parsedAttr: ParsedAttribute,
    parent: ParentNode
): Slot {
    if (ast.isForBlock(parent) || ast.isIfBlock(parent)) {
        ctx.throwAtLocation(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, elementLocation);
    }

    // Can't handle slots in applySlot because it would be too late for class and style attrs
    if (ctx.renderMode === LWC_RENDERMODE.LIGHT) {
        const invalidAttrs = parsedAttr
            .getAttributes()
            .filter(({ name }) => name !== 'name')
            .map(({ name }) => name);

        if (invalidAttrs.length > 0) {
            // Light DOM slots cannot have events because there's no actual `<slot>` element
            const eventHandler = invalidAttrs.find((name) => name.match(EVENT_HANDLER_NAME_RE));
            if (eventHandler) {
                ctx.throwAtLocation(
                    ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_EVENT_LISTENER,
                    elementLocation,
                    [eventHandler]
                );
            }

            ctx.throwAtLocation(
                ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_ATTRIBUTES,
                elementLocation,
                [invalidAttrs.join(',')]
            );
        }
    }

    // Default slot have empty string name
    let name = '';

    const nameAttribute = parsedAttr.get('name');
    if (nameAttribute) {
        if (ast.isExpression(nameAttribute.value)) {
            ctx.throwOnNode(ParserDiagnostics.NAME_ON_SLOT_CANNOT_BE_EXPRESSION, nameAttribute);
        } else if (ast.isStringLiteral(nameAttribute.value)) {
            name = nameAttribute.value.value;
        }
    }

    const alreadySeen = ctx.seenSlots.has(name);
    ctx.seenSlots.add(name);

    if (alreadySeen) {
        ctx.warnAtLocation(
            ParserDiagnostics.NO_DUPLICATE_SLOTS,
            elementLocation,
            [name === '' ? 'default' : `name="${name}"`],
        );
    } else if (isInIteration(ctx)) {
        ctx.warnAtLocation(
            ParserDiagnostics.NO_SLOTS_IN_ITERATOR,
            elementLocation,
            [name === '' ? 'default' : `name="${name}"`],
        );
    }

    return ast.slot(name, elementLocation);
}

function applyAttributes(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parsedAttr: ParsedAttribute
) {
    const tag = parseTagName(element);
    const attributes = parsedAttr.getAttributes();

    for (const attr of attributes) {
        const { name } = attr;

        if (!isValidHTMLAttribute(tag, name)) {
            ctx.warnOnNode(ParserDiagnostics.INVALID_HTML_ATTRIBUTE, attr, [name, tag]);
        }

        if (name.match(/[^a-z0-9]$/)) {
            ctx.throwOnNode(
                ParserDiagnostics.ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER,
                attr,
                [name, tag]
            );
        }

        if (!/^-*[a-z]/.test(name)) {
            ctx.throwOnNode(
                ParserDiagnostics.ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER,
                attr,
                [name, tag]
            );
        }

        // disallow attr name which combines underscore character with special character.
        // We normalize camel-cased names with underscores caMel -> ca-mel; thus sanitization.
        if (name.match(/_[^a-z0-9]|[^a-z0-9]_/)) {
            ctx.throwOnNode(
                ParserDiagnostics.ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS,
                attr,
                [name, tag]
            );
        }

        if (ast.isStringLiteral(attr.value)) {
            if (name === 'id') {
                const { value } = attr.value;

                if (/\s+/.test(value)) {
                    ctx.throwOnNode(ParserDiagnostics.INVALID_ID_ATTRIBUTE, attr, [value]);
                }

                if (isInIteration(ctx)) {
                    ctx.warnOnNode(ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION, attr);
                }

                if (ctx.seenIds.has(value)) {
                    ctx.throwOnNode(ParserDiagnostics.DUPLICATE_ID_FOUND, attr, [value]);
                } else {
                    ctx.seenIds.add(value);
                }
            }
        }

        // Prevent usage of the slot attribute with expression.
        if (name === 'slot' && ast.isExpression(attr.value)) {
            ctx.throwOnNode(ParserDiagnostics.SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION, attr);
        }

        // the if branch handles
        // 1. All attributes for standard elements except 1 case are handled as attributes
        // 2. For custom elements, only key, slot and data are handled as attributes, rest as properties
        if (isAttribute(element, name)) {
            element.attributes.push(attr);
        } else {
            const propName = attributeToPropertyName(name);
            element.properties.push(ast.property(propName, attr.value, attr.location));

            parsedAttr.pick(name);
        }
    }
}

function validateRoot(ctx: ParserCtx, root: Root, parse5Elm: parse5.Element) {
    const { tagName: tag } = parse5Elm;

    if (!ast.isTemplate(root)) {
        ctx.throwOnNode(ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE, root, [tag]);
    }

    const rootHasUnknownAttributes = parse5Elm.attrs.some(
        ({ name }) => !ROOT_TEMPLATE_DIRECTIVES_SET.has(name)
    );

    if (rootHasUnknownAttributes) {
        ctx.throwOnNode(ParserDiagnostics.ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES, root);
    }

    // Check if a non-void element has a matching closing tag.
    //
    // Note: Parse5 currently fails to collect end tag location for element with a tag name
    // containing an upper case character (inikulin/parse5#352).
    const location = parseElementLocation(ctx, parse5Elm)!;
    const hasClosingTag = Boolean(location.endTag);
    const isVoidElement = VOID_ELEMENT_SET.has(tag);
    if (!isVoidElement && !hasClosingTag && tag === tag.toLocaleLowerCase()) {
        ctx.throwOnNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, root, [tag]);
    }
}

function validateElement(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parse5Elm: parse5.Element
) {
    const { tagName: tag, namespaceURI: namespace } = parse5Elm;
    const elementLocation = parseElementLocation(ctx, parse5Elm)!;

    // Check if a non-void element has a matching closing tag.
    //
    // Note: Parse5 currently fails to collect end tag location for element with a tag name
    // containing an upper case character (inikulin/parse5#352).
    const hasClosingTag = Boolean(elementLocation.endTag);
    const isVoidElement = VOID_ELEMENT_SET.has(tag);
    if (!isVoidElement && !hasClosingTag && tag === tag.toLocaleLowerCase()) {
        ctx.throwOnNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, element, [tag]);
    }

    if (tag === 'style' && namespace === HTML_NAMESPACE_URI) {
        ctx.throwOnNode(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, element);
    } else if (tag === 'template') {
        // We check if the template element has some modifier applied to it. Directly checking if one of the
        // IRElement property is impossible. For example when an error occurs during the parsing of the if
        // expression, the `element.if` property remains undefined. It would results in 2 warnings instead of 1:
        //      - Invalid if expression
        //      - Unexpected template element
        //
        // Checking if the original HTMLElement has some attributes applied is a good enough for now.
        const hasAttributes = parse5Elm.attrs.length !== 0;
        if (!hasAttributes) {
            ctx.throwOnNode(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, element);
        }

        // Non root templates only support for:each, iterator and if directives
        if (element.properties.length || element.attributes.length || element.listeners.length || element.directives) {
            ctx.warnOnNode(ParserDiagnostics.UNKNOWN_TEMPLATE_ATTRIBUTE, element);
        }
    } else {
        const isNotAllowedHtmlTag = DISALLOWED_HTML_TAGS.has(tag);
        if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE, element, [tag]);
        }

        const isNotAllowedSvgTag = !SUPPORTED_SVG_TAGS.has(tag);
        if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE, element, [tag]);
        }

        const isNotAllowedMathMlTag = DISALLOWED_MATHML_TAGS.has(tag);
        if (namespace === MATHML_NAMESPACE_URI && isNotAllowedMathMlTag) {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE, element, [
                tag,
            ]);
        }

        const isKnownTag =
            ast.isComponent(element) ||
            KNOWN_HTML_ELEMENTS.has(tag) ||
            SUPPORTED_SVG_TAGS.has(tag) ||
            DASHED_TAGNAME_ELEMENT_SET.has(tag);

        if (!isKnownTag) {
            ctx.warnOnNode(ParserDiagnostics.UNKNOWN_HTML_TAG_IN_TEMPLATE, element, [tag]);
        }
    }
}

function validateTemplate(ctx: ParserCtx, parse5Elm: parse5.Element) {
    if (parse5Elm.tagName === 'template') {
        const location = parseSourceLocation(ctx, parse5Elm)
        const hasAttributes = parse5Elm.attrs.length !== 0;
        if (!hasAttributes) {
            ctx.throwAtLocation(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, location);
        }
    }
}

function validateChildren(ctx: ParserCtx, element?: Element | Component | Slot) {
    if (!element) {
        return;
    }

    const effectiveChildren = ctx.preserveComments
        ? element.children
        : element.children.filter((child) => !ast.isCommentNode(child));
    const hasDomDirective = element.directives?.find(ast.isDirectiveType('Dom'));
    if (hasDomDirective && effectiveChildren.length > 0) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element);
    }

    // prevents lwc:inner-html to be used in an element with content
    if (element.directives?.find(ast.isInnerHTMLDirective) && effectiveChildren.length) {
        ctx.throwOnNode(ParserDiagnostics.LWC_INNER_HTML_INVALID_CONTENTS, element, [
            `<${element.name}>`,
        ]);
    }
}

function validateAttributes(
    ctx: ParserCtx,
    element: Element | Component | Slot,
    parsedAttr: ParsedAttribute
) {
    const tag = parseTagName(element);
    const attributes = parsedAttr.getAttributes();

    for (const attr of attributes) {
        const { name: attrName, value: attrVal } = attr;

        if (isProhibitedIsAttribute(attrName)) {
            ctx.throwOnNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element);
        }

        if (isTabIndexAttribute(attrName)) {
            if (!ast.isExpression(attrVal) && !isValidTabIndexAttributeValue(attrVal.value)) {
                ctx.throwOnNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
            }
        }

        // TODO [#1136]: once the template compiler emits the element namespace information to the engine we should
        // restrict the validation of the "srcdoc" attribute on the "iframe" element only if this element is
        // part of the HTML namespace.
        if (tag === 'iframe' && attrName === 'srcdoc') {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE, element);
        }
    }
}

function validateProperties(ctx: ParserCtx, element: BaseElement) {
    for (const prop of element.properties) {
        const { name, value } = prop;
        const attrName = propertyToAttributeName(name);

        if (isProhibitedIsAttribute(attrName)) {
            ctx.throwOnNode(ParserDiagnostics.IS_ATTRIBUTE_NOT_SUPPORTED, element);
        }

        if (
            // tabindex is transformed to tabIndex for properties
            isTabIndexAttribute(attrName) &&
            !ast.isExpression(value) &&
            !isValidTabIndexAttributeValue(value.value)
        ) {
            ctx.throwOnNode(ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE, element);
        }
    }
}

function parseAttributes(ctx: ParserCtx, parse5Elm: parse5.Element): ParsedAttribute {
    const parsedAttrs = new ParsedAttribute();
    const { attrs: attributes, tagName } = parse5Elm;
    const { attrs: attrLocations } = parseElementLocation(ctx, parse5Elm)!;

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

    const location = ast.sourceLocation(rawLocation);
    // parse5 automatically converts the casing from camelcase to all lowercase. If the attribute name
    // is not the same before and after the parsing, then the attribute name contains capital letters
    if (!rawAttribute.startsWith(name)) {
        ctx.throwAtLocation(ParserDiagnostics.INVALID_ATTRIBUTE_CASE, location, [
            rawAttribute,
            tag,
        ]);
    }

    const isBooleanAttribute = !rawAttribute.includes('=');
    const { value, escapedExpression } = normalizeAttributeValue(
        ctx,
        rawAttribute,
        tag,
        attribute,
        location
    );

    let attrValue: Literal | Expression;
    if (isExpression(value) && !escapedExpression) {
        attrValue = parseExpression(ctx, value, location);
    } else if (isBooleanAttribute) {
        attrValue = ast.literal(true);
    } else {
        attrValue = ast.literal(value);
    }

    return ast.attribute(name, attrValue, location);
}

function isInIteration(ctx: ParserCtx): boolean {
    return !!ctx.findAncestor({
        predicate: (node) => ast.isForBlock(node),
        // traversalCond: ({ parent }) => parent && ast.isForBlock(parent)
    });
}

function getForOfParent(ctx: ParserCtx, src: ParentNode): ForOf | null {
    const ancestor = ctx.findAncestor({
        element: src,
        predicate: (node) => ast.isForOf(node),
        traversalCond: ({ current }) => current && !ast.isBaseElement(current),
    });

    if (ancestor && ast.isForOf(ancestor)) {
        return ancestor;
    }

    return null;
}

function getForEachParent(ctx: ParserCtx): ForEach | null {
    const ancestor = ctx.findAncestor({
        predicate: (node) => ast.isForEach(node),
        traversalCond: ({ parent }) => parent && !ast.isBaseElement(parent),
    });

    if (ancestor && ast.isForEach(ancestor)) {
        return ancestor;
    }

    return null;
}

function isInIteratorElement(ctx: ParserCtx, parent: ParentNode): boolean {
    return !!(getForOfParent(ctx, parent) || getForEachParent(ctx));
}
