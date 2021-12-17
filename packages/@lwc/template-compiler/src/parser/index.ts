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
    propertyToAttributeName,
} from './attribute';

import { isExpression, parseExpression, parseIdentifier } from './expression';

import * as t from '../shared/estree';
import * as parse5Utils from '../shared/parse5';
import * as ast from '../shared/ast';
import {
    TemplateParseResult,
    Attribute,
    ForEach,
    Identifier,
    Literal,
    Expression,
    ForOf,
    Slot,
    Text,
    Root,
    ParentNode,
    BaseElement,
    Comment,
    LWCDirectiveRenderMode,
    LWCDirectiveDomMode,
    If,
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
    LWC_DIRECTIVES,
    LWC_DIRECTIVE_SET,
    LWC_RE,
    MATHML_NAMESPACE_URI,
    ROOT_TEMPLATE_DIRECTIVES,
    SUPPORTED_SVG_TAGS,
    SVG_NAMESPACE_URI,
    VALID_IF_MODIFIER,
    VOID_ELEMENT_SET,
} from './constants';

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
    const { sourceCodeLocation: rootLocation } = parse5Elm;

    if (!rootLocation) {
        // Parse5 will recover from invalid HTML. When this happens the node's sourceCodeLocation will be undefined.
        // https://github.com/inikulin/parse5/blob/master/packages/parse5/docs/options/parser-options.md#sourcecodelocationinfo
        // This is a defensive check as this should never happen for the root template.
        throw new Error(
            'An internal parsing error occurred during node creation; the root template node does not have a sourceCodeLocation.'
        );
    }

    if (parse5Elm.tagName !== 'template') {
        ctx.throw(
            ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE,
            [parse5Elm.tagName],
            ast.sourceLocation(rootLocation)
        );
    }

    const parsedAttr = parseAttributes(ctx, parse5Elm, rootLocation);
    const root = ast.root(rootLocation);

    applyRootLwcDirectives(ctx, parsedAttr, root);
    ctx.setRootDirective(root);
    validateRoot(ctx, parsedAttr, root);
    parseChildren(ctx, parse5Elm, root, rootLocation);

    return root;
}

function parseElement(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parentNode: ParentNode,
    parse5ParentLocation: parse5.ElementLocation
): void {
    const parse5ElmLocation = parseElementLocation(ctx, parse5Elm, parse5ParentLocation);
    const parsedAttr = parseAttributes(ctx, parse5Elm, parse5ElmLocation);
    const directive = parseElementDirectives(ctx, parsedAttr, parentNode, parse5ElmLocation);
    const element = parseBaseElement(
        ctx,
        parsedAttr,
        parse5Elm,
        directive || parentNode,
        parse5ElmLocation
    );

    if (element) {
        applyHandlers(ctx, parsedAttr, element);
        applyKey(ctx, parsedAttr, element, parentNode);
        applyLwcDirectives(ctx, parsedAttr, element);
        applyAttributes(ctx, parsedAttr, element);

        validateElement(ctx, element, parse5Elm);
        validateAttributes(ctx, parsedAttr, element);
        validateProperties(ctx, element);
    }

    validateTemplate(ctx, parsedAttr, parse5Elm, parse5ElmLocation);

    const currentNode = element || directive;
    if (currentNode) {
        parseChildren(ctx, parse5Elm, currentNode, parse5ElmLocation);
        validateChildren(ctx, element);
    }
}

function parseElementLocation(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parse5ParentLocation: parse5.ElementLocation
): parse5.ElementLocation {
    let location = parse5Elm.sourceCodeLocation;

    // AST hierarchy is ForBlock > If > BaseElement, if immediate parent is not a BaseElement it is a template.
    const parentNode = ctx.findAncestor(ast.isBaseElement, () => false);

    if (!location) {
        // Parse5 will recover from invalid HTML. When this happens the element's sourceCodeLocation will be undefined.
        // https://github.com/inikulin/parse5/blob/master/packages/parse5/docs/options/parser-options.md#sourcecodelocationinfo
        ctx.warn(ParserDiagnostics.INVALID_HTML_RECOVERY, [
            parse5Elm.tagName,
            parentNode?.name ?? 'template',
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

    return location ?? parse5ParentLocation;
}

function parseElementDirectives(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parent: ParentNode,
    parse5ElmLocation: parse5.ElementLocation
): ParentNode | undefined {
    let current: ParentNode | undefined;

    const parsers = [parseForEach, parseForOf, parseIf];
    for (const parser of parsers) {
        const prev = current || parent;
        const node = parser(ctx, parsedAttr, parse5ElmLocation);
        if (node) {
            ctx.addNodeCurrentScope(node);
            prev.children.push(node);
            current = node;
        }
    }

    return current;
}

function parseBaseElement(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5Elm: parse5.Element,
    parent: ParentNode,
    parse5ElmLocation: parse5.ElementLocation
): BaseElement | undefined {
    const { tagName: tag } = parse5Elm;

    let element: BaseElement | undefined;
    if (tag === 'slot') {
        element = parseSlot(ctx, parsedAttr, parse5ElmLocation);
        // Skip creating template nodes
    } else if (tag !== 'template') {
        // Check if the element tag is a valid custom element name and is not part of known standard
        // element name containing a dash.
        if (!tag.includes('-') || DASHED_TAGNAME_ELEMENT_SET.has(tag)) {
            element = ast.element(parse5Elm, parse5ElmLocation);
        } else {
            element = ast.component(parse5Elm, parse5ElmLocation);
        }
    }

    if (element) {
        ctx.addNodeCurrentScope(element);
        parent.children.push(element);
    }

    return element;
}

function parseChildren(
    ctx: ParserCtx,
    parse5Parent: parse5.Element,
    parent: ParentNode,
    parse5ParentLocation: parse5.ElementLocation
): void {
    const children = (parse5Utils.getTemplateContent(parse5Parent) ?? parse5Parent).childNodes;

    for (const child of children) {
        ctx.withErrorRecovery(() => {
            if (parse5Utils.isElementNode(child)) {
                ctx.beginScope();
                parseElement(ctx, child, parent, parse5ParentLocation);
                ctx.endScope();
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
            'An internal parsing error occurred during node creation; a text node was found without a sourceCodeLocation.'
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
            'An internal parsing error occurred during node creation; a comment node was found without a sourceCodeLocation.'
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
        const duplicateRoot = validRoots[1].sourceCodeLocation;
        ctx.throw(
            ParserDiagnostics.MULTIPLE_ROOTS_FOUND,
            [],
            duplicateRoot ? ast.sourceLocation(duplicateRoot) : duplicateRoot
        );
    }

    const [root] = validRoots;

    if (!root || !parse5Utils.isElementNode(root)) {
        ctx.throw(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
    }

    return root;
}

function applyHandlers(ctx: ParserCtx, parsedAttr: ParsedAttribute, element: BaseElement): void {
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

function parseIf(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5.ElementLocation
): If | undefined {
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

    return ast.ifNode(
        modifier,
        ifAttribute.value,
        ast.sourceLocation(parse5ElmLocation),
        ifAttribute.location
    );
}

function applyRootLwcDirectives(ctx: ParserCtx, parsedAttr: ParsedAttribute, root: Root): void {
    const lwcAttribute = parsedAttr.get(LWC_RE);
    if (!lwcAttribute) {
        return;
    }

    applyLwcRenderModeDirective(ctx, parsedAttr, root);
    applyLwcPreserveCommentsDirective(ctx, parsedAttr, root);
}

function applyLwcRenderModeDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    root: Root
): void {
    const lwcRenderModeAttribute = parsedAttr.pick(ROOT_TEMPLATE_DIRECTIVES.RENDER_MODE);
    if (!lwcRenderModeAttribute) {
        return;
    }

    const { value: renderDomAttr } = lwcRenderModeAttribute;

    if (
        !ast.isStringLiteral(renderDomAttr) ||
        (renderDomAttr.value !== LWCDirectiveRenderMode.shadow &&
            renderDomAttr.value !== LWCDirectiveRenderMode.light)
    ) {
        ctx.throwOnNode(ParserDiagnostics.LWC_RENDER_MODE_INVALID_VALUE, root);
    }

    root.directives.push(
        ast.renderModeDirective(renderDomAttr.value, lwcRenderModeAttribute.location)
    );
}

function applyLwcPreserveCommentsDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    root: Root
): void {
    const lwcPreserveCommentAttribute = parsedAttr.pick(ROOT_TEMPLATE_DIRECTIVES.PRESERVE_COMMENTS);
    if (!lwcPreserveCommentAttribute) {
        return;
    }

    const { value: lwcPreserveCommentsAttr } = lwcPreserveCommentAttribute;

    if (!ast.isBooleanLiteral(lwcPreserveCommentsAttr)) {
        ctx.throwOnNode(ParserDiagnostics.PRESERVE_COMMENTS_MUST_BE_BOOLEAN, root);
    }

    root.directives.push(
        ast.preserveCommentsDirective(
            lwcPreserveCommentsAttr.value,
            lwcPreserveCommentAttribute.location
        )
    );
}

function applyLwcDirectives(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const lwcAttribute = parsedAttr.get(LWC_RE);
    if (!lwcAttribute) {
        return;
    }

    if (!LWC_DIRECTIVE_SET.has(lwcAttribute.name)) {
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

    applyLwcDynamicDirective(ctx, parsedAttr, element);
    applyLwcDomDirective(ctx, parsedAttr, element);
    applyLwcInnerHtmlDirective(ctx, parsedAttr, element);
}

function applyLwcDynamicDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;

    const lwcDynamicAttribute = parsedAttr.pick('lwc:dynamic');
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

    element.directives.push(ast.dynamicDirective(lwcDynamicAttr, lwcDynamicAttr.location));
}

function applyLwcDomDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;

    const lwcDomAttribute = parsedAttr.pick('lwc:dom');
    if (!lwcDomAttribute) {
        return;
    }

    if (ctx.renderMode === LWCDirectiveRenderMode.light) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_IN_LIGHT_DOM, element, [`<${tag}>`]);
    }

    if (ast.isComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT, element, [`<${tag}>`]);
    }

    if (ast.isSlot(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT, element);
    }

    const { value: lwcDomAttr } = lwcDomAttribute;

    if (!ast.isStringLiteral(lwcDomAttr) || lwcDomAttr.value !== LWCDirectiveDomMode.manual) {
        const possibleValues = Object.keys(LWCDirectiveDomMode)
            .map((value) => `"${value}"`)
            .join(', or ');
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element, [possibleValues]);
    }

    element.directives.push(ast.domDirective(lwcDomAttr.value, lwcDomAttribute.location));
}

function applyLwcInnerHtmlDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const lwcInnerHtmlDirective = parsedAttr.pick(LWC_DIRECTIVES.INNER_HTML);

    if (!lwcInnerHtmlDirective) {
        return;
    }

    if (ast.isComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_INNER_HTML_INVALID_CUSTOM_ELEMENT, element, [
            `<${element.name}>`,
        ]);
    }

    if (ast.isSlot(element)) {
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

    element.directives.push(ast.innerHTMLDirective(innerHTMLVal, lwcInnerHtmlDirective.location));
}

function parseForEach(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5.ElementLocation
): ForEach | undefined {
    const forEachAttribute = parsedAttr.pick('for:each');
    const forItemAttribute = parsedAttr.pick('for:item');
    const forIndex = parsedAttr.pick('for:index');

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

        return ast.forEach(
            forEachAttribute.value,
            ast.sourceLocation(parse5ElmLocation),
            forEachAttribute.location,
            item,
            index
        );
    } else if (forEachAttribute || forItemAttribute) {
        ctx.throwAtLocation(
            ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
            ast.sourceLocation(parse5ElmLocation)
        );
    }
}

function parseForOf(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5.ElementLocation
): ForOf | undefined {
    const iteratorExpression = parsedAttr.pick(ITERATOR_RE);
    if (!iteratorExpression) {
        return;
    }

    const hasForEach = ctx.findSibling(ast.isForEach);
    if (hasForEach) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_FOR_EACH_WITH_ITERATOR,
            ast.sourceLocation(parse5ElmLocation),
            [iteratorExpression.name]
        );
    }

    const iteratorAttributeName = iteratorExpression.name;
    const [, iteratorName] = iteratorAttributeName.split(':');

    if (!ast.isExpression(iteratorExpression.value)) {
        ctx.throwOnNode(ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION, iteratorExpression, [
            iteratorExpression.name,
        ]);
    }

    const iterator = parseIdentifier(ctx, iteratorName, iteratorExpression.location);

    return ast.forOf(
        iteratorExpression.value,
        iterator,
        ast.sourceLocation(parse5ElmLocation),
        iteratorExpression.location
    );
}

function applyKey(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement,
    parent: ParentNode
): void {
    const { name: tag } = element;
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

        element.directives.push(ast.keyDirective(keyAttribute.value, keyAttribute.location));
    } else if (isInIteratorElement(ctx, parent)) {
        ctx.throwOnNode(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, element, [tag]);
    }
}

function parseSlot(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5.ElementLocation
): Slot {
    const location = ast.sourceLocation(parse5ElmLocation);

    const hasDirectives = ctx.findSibling(ast.isForBlock) || ctx.findSibling(ast.isIf);
    if (hasDirectives) {
        ctx.throwAtLocation(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, location);
    }

    // Can't handle slots in applySlot because it would be too late for class and style attrs
    if (ctx.renderMode === LWCDirectiveRenderMode.light) {
        const invalidAttrs = parsedAttr
            .getAttributes()
            .filter(({ name }) => name !== 'name')
            .map(({ name }) => name);

        if (invalidAttrs.length) {
            // Light DOM slots cannot have events because there's no actual `<slot>` element
            const eventHandler = invalidAttrs.find((name) => name.match(EVENT_HANDLER_NAME_RE));
            if (eventHandler) {
                ctx.throwAtLocation(
                    ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_EVENT_LISTENER,
                    location,
                    [eventHandler]
                );
            }

            ctx.throwAtLocation(ParserDiagnostics.LWC_LIGHT_SLOT_INVALID_ATTRIBUTES, location, [
                invalidAttrs.join(','),
            ]);
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
        ctx.warnAtLocation(ParserDiagnostics.NO_DUPLICATE_SLOTS, location, [
            name === '' ? 'default' : `name="${name}"`,
        ]);
    } else if (isInIteration(ctx)) {
        ctx.warnAtLocation(ParserDiagnostics.NO_SLOTS_IN_ITERATOR, location, [
            name === '' ? 'default' : `name="${name}"`,
        ]);
    }

    return ast.slot(name, parse5ElmLocation);
}

function applyAttributes(ctx: ParserCtx, parsedAttr: ParsedAttribute, element: BaseElement): void {
    const { name: tag } = element;
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

function validateRoot(ctx: ParserCtx, parsedAttr: ParsedAttribute, root: Root): void {
    if (parsedAttr.getAttributes().length) {
        ctx.throwOnNode(ParserDiagnostics.ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES, root);
    }

    if (!root.location.endTag) {
        ctx.throwOnNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, root, ['template']);
    }
}

function validateElement(ctx: ParserCtx, element: BaseElement, parse5Elm: parse5.Element): void {
    const { tagName: tag, namespaceURI: namespace } = parse5Elm;

    // Check if a non-void element has a matching closing tag.
    //
    // Note: Parse5 currently fails to collect end tag location for element with a tag name
    // containing an upper case character (inikulin/parse5#352).
    const hasClosingTag = Boolean(element.location.endTag);
    const isVoidElement = VOID_ELEMENT_SET.has(tag);
    if (!isVoidElement && !hasClosingTag && tag === tag.toLocaleLowerCase()) {
        ctx.throwOnNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, element, [tag]);
    }

    if (tag === 'style' && namespace === HTML_NAMESPACE_URI) {
        ctx.throwOnNode(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, element);
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

function validateTemplate(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5Elm: parse5.Element,
    parse5ElmLocation: parse5.ElementLocation
): void {
    if (parse5Elm.tagName === 'template') {
        const location = ast.sourceLocation(parse5ElmLocation);

        // Empty templates not allowed outside of root
        if (!parse5Elm.attrs.length) {
            ctx.throwAtLocation(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, location);
        }

        if (parsedAttr.get(LWC_DIRECTIVES.INNER_HTML)) {
            ctx.throwAtLocation(ParserDiagnostics.LWC_INNER_HTML_INVALID_ELEMENT, location, [
                '<template>',
            ]);
        }

        // Non root templates only support for:each, iterator and if directives
        if (parsedAttr.getAttributes().length) {
            ctx.warnAtLocation(ParserDiagnostics.UNKNOWN_TEMPLATE_ATTRIBUTE, location);
        }
    }
}

function validateChildren(ctx: ParserCtx, element?: BaseElement): void {
    if (!element) {
        return;
    }

    const effectiveChildren = ctx.preserveComments
        ? element.children
        : element.children.filter((child) => !ast.isComment(child));

    const hasDomDirective = element.directives.find(ast.isDomDirective);
    if (hasDomDirective && effectiveChildren.length) {
        ctx.throwOnNode(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element);
    }

    // prevents lwc:inner-html to be used in an element with content
    if (element.directives.find(ast.isInnerHTMLDirective) && effectiveChildren.length) {
        ctx.throwOnNode(ParserDiagnostics.LWC_INNER_HTML_INVALID_CONTENTS, element, [
            `<${element.name}>`,
        ]);
    }
}

function validateAttributes(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;
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

function validateProperties(ctx: ParserCtx, element: BaseElement): void {
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

function parseAttributes(
    ctx: ParserCtx,
    parse5Elm: parse5.Element,
    parse5ElmLocation: parse5.ElementLocation
): ParsedAttribute {
    const parsedAttrs = new ParsedAttribute();
    const { attrs: attributes, tagName } = parse5Elm;
    const { attrs: attrLocations } = parse5ElmLocation;

    for (const attr of attributes) {
        const attrLocation = attrLocations?.[attributeName(attr).toLowerCase()];
        if (!attrLocation) {
            throw new Error(
                'An internal parsing error occurred while parsing attributes; attributes were found without a location.'
            );
        }

        parsedAttrs.append(getTemplateAttribute(ctx, tagName, attr, attrLocation));
    }

    return parsedAttrs;
}

function getTemplateAttribute(
    ctx: ParserCtx,
    tag: string,
    attribute: parse5.Attribute,
    attributeLocation: parse5.Location
): Attribute {
    // Convert attribute name to lowercase because the location map keys follow the algorithm defined in the spec
    // https://wicg.github.io/controls-list/html-output/multipage/syntax.html#attribute-name-state
    const rawAttribute = ctx.getSource(attributeLocation.startOffset, attributeLocation.endOffset);
    const location = ast.sourceLocation(attributeLocation);

    // parse5 automatically converts the casing from camelcase to all lowercase. If the attribute name
    // is not the same before and after the parsing, then the attribute name contains capital letters
    const attrName = attributeName(attribute);
    if (!rawAttribute.startsWith(attrName)) {
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

    return ast.attribute(attrName, attrValue, location);
}

function isInIteration(ctx: ParserCtx): boolean {
    return !!ctx.findAncestor(ast.isForBlock);
}

function getForOfParent(ctx: ParserCtx, srcNode: ParentNode): ForOf | null {
    return ctx.findAncestor(ast.isForOf, ({ current }) => !ast.isBaseElement(current), srcNode);
}

function getForEachParent(ctx: ParserCtx): ForEach | null {
    return ctx.findAncestor(ast.isForEach, ({ parent }) => parent && !ast.isBaseElement(parent));
}

function isInIteratorElement(ctx: ParserCtx, parent: ParentNode): boolean {
    return !!(getForOfParent(ctx, parent) || getForEachParent(ctx));
}
