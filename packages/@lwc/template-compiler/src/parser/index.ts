/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    HTML_NAMESPACE,
    SVG_NAMESPACE,
    MATHML_NAMESPACE,
    isVoidElement,
    isUndefined,
    isNull,
} from '@lwc/shared';
import { ParserDiagnostics, DiagnosticLevel, CompilerMetrics } from '@lwc/errors';
import * as parse5Tools from '@parse5/tools';
import { Token as parse5Token } from 'parse5';

import * as t from '../shared/estree';
import * as ast from '../shared/ast';
import State from '../state';
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
    IfBlock,
    ElseBlock,
    ElseifBlock,
    Property,
    ElementDirectiveName,
    RootDirectiveName,
    ScopedSlotFragment,
    TemplateDirectiveName,
    LwcTagName,
    LwcComponent,
    Element,
} from '../shared/types';
import { isCustomElementTag, isLwcElementTag } from '../shared/utils';
import { DASHED_TAGNAME_ELEMENT_SET } from '../shared/constants';
import ParserCtx from './parser';

import { cleanTextNode, decodeTextContent, parseHTML } from './html';
import { isExpression, parseExpression, parseIdentifier } from './expression';
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
    DISALLOWED_HTML_TAGS,
    DISALLOWED_MATHML_TAGS,
    EVENT_HANDLER_NAME_RE,
    EVENT_HANDLER_RE,
    EXPRESSION_RE,
    IF_RE,
    ITERATOR_RE,
    KNOWN_HTML_AND_SVG_ELEMENTS,
    LWC_DIRECTIVE_SET,
    LWC_RE,
    SUPPORTED_SVG_TAGS,
    VALID_IF_MODIFIER,
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

    if (ctx.warnings.some((_) => _.level === DiagnosticLevel.Error)) {
        return { warnings: ctx.warnings };
    }

    const root = ctx.withErrorRecovery(() => {
        const templateRoot = getTemplateRoot(ctx, fragment);
        return parseRoot(ctx, templateRoot);
    });

    return { root, warnings: ctx.warnings };
}

function parseRoot(ctx: ParserCtx, parse5Elm: parse5Tools.Element): Root {
    const { sourceCodeLocation: rootLocation } = parse5Elm;

    /* istanbul ignore if */
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

/**
 * This function will create LWC AST nodes from an HTML element.
 * A node is generated for each LWC HTML template directive attached to the
 * element as well as the element itself (excluding template tag elements).
 *
 * The hierarchy of nodes created is as follows:
 *
 * For/Iterator -> If -> Element/Component/Slot
 *
 * For each node that's created, the parent will be the most recently
 * created node otherwise it will be parentNode.
 *
 * Note: Not every node in the hierarchy is guaranteed to be created, for example,
 * <div></div> will only create an Element node.
 */
function parseElement(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    parentNode: ParentNode,
    parse5ParentLocation: parse5Token.ElementLocation
): void {
    const parse5ElmLocation = parseElementLocation(ctx, parse5Elm, parse5ParentLocation);
    const parsedAttr = parseAttributes(ctx, parse5Elm, parse5ElmLocation);
    // Create an AST node for each LWC template directive and chain them into a parent child hierarchy
    const directive = parseElementDirectives(
        ctx,
        parse5Elm,
        parse5ElmLocation,
        parentNode,
        parsedAttr
    );
    // Create an AST node for the HTML element (excluding template tag elements) and add as child to parent
    const element = parseBaseElement(
        ctx,
        parsedAttr,
        parse5Elm,
        directive ?? parentNode,
        parse5ElmLocation
    );

    if (element) {
        applyHandlers(ctx, parsedAttr, element);
        applyKey(ctx, parsedAttr, element);
        applyLwcDirectives(ctx, parsedAttr, element);
        applyAttributes(ctx, parsedAttr, element);

        validateElement(ctx, element, parse5Elm);
        validateAttributes(ctx, parsedAttr, element);
        validateProperties(ctx, element);
    } else {
        // parseBaseElement will always return an element EXCEPT when processing a <template>
        validateTemplate(ctx, parsedAttr, parse5Elm as parse5Tools.Template, parse5ElmLocation);
    }

    const currentNode = element ?? directive;
    if (currentNode) {
        parseChildren(ctx, parse5Elm, currentNode, parse5ElmLocation);
        validateChildren(ctx, element, directive);
    } else {
        // The only scenario where currentNode can be undefined is when there are only invalid attributes on a template element.
        // For example, <template class='slds-hello-world'>, these template elements and their children will not be rendered.
        ctx.warnAtLocation(
            ParserDiagnostics.INVALID_TEMPLATE_WARNING,
            ast.sourceLocation(parse5ElmLocation)
        );
    }
}

function parseElementLocation(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    parse5ParentLocation: parse5Token.ElementLocation
): parse5Token.ElementLocation {
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

    while (!location && current.parentNode && parse5Tools.isElementNode(current.parentNode)) {
        current = current.parentNode as parse5Tools.Element;
        location = current.sourceCodeLocation;
    }

    return location ?? parse5ParentLocation;
}

const DIRECTIVE_PARSERS = [
    parseIfBlock,
    parseElseifBlock,
    parseElseBlock,
    parseForEach,
    parseForOf,
    parseIf,
    parseScopedSlotFragment,
];
function parseElementDirectives(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    parent: ParentNode,
    parsedAttr: ParsedAttribute
): ParentNode | undefined {
    let current: ParentNode | undefined;

    for (const parser of DIRECTIVE_PARSERS) {
        const prev = current || parent;
        const node = parser(ctx, parse5Elm, parse5ElmLocation, prev, parsedAttr);
        if (node) {
            current = node;
        }
    }
    return current;
}

function parseBaseElement(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5Elm: parse5Tools.Element,
    parent: ParentNode,
    parse5ElmLocation: parse5Token.ElementLocation
): BaseElement | undefined {
    const { tagName: tag, namespaceURI } = parse5Elm;

    let element: BaseElement | undefined;
    if (tag === 'slot') {
        element = parseSlot(ctx, parsedAttr, parse5ElmLocation);
        // Skip creating template nodes
    } else if (tag !== 'template') {
        // Check if the element tag is a valid custom element name and is not part of known standard
        // element name containing a dash.
        if (isCustomElementTag(tag)) {
            if (parsedAttr.get(ElementDirectiveName.External)) {
                element = ast.externalComponent(tag, parse5ElmLocation);
            } else {
                element = ast.component(tag, parse5ElmLocation);
            }
        } else if (isLwcElementTag(tag)) {
            // Special tag names that begin with lwc:*
            element = parseLwcElement(ctx, parse5Elm, parsedAttr, parse5ElmLocation);
        } else {
            // Built-in HTML elements
            element = ast.element(tag, namespaceURI, parse5ElmLocation);
        }
    }

    if (element) {
        ctx.addNodeCurrentElementScope(element);
        parent.children.push(element);
    }

    return element;
}

function parseLwcElement(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5Token.ElementLocation
) {
    let lwcElementParser;

    switch (parse5Elm.tagName) {
        case LwcTagName.Component:
            lwcElementParser = parseLwcComponent;
            break;
        default:
            lwcElementParser = parseLwcElementAsBuiltIn;
    }

    return lwcElementParser(ctx, parse5Elm, parsedAttr, parse5ElmLocation);
}

function parseLwcComponent(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5Token.ElementLocation
): LwcComponent {
    if (!ctx.config.enableDynamicComponents) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_OPTS_LWC_ENABLE_DYNAMIC_COMPONENTS,
            ast.sourceLocation(parse5ElmLocation)
        );
    }

    // <lwc:component> must be used with lwc:is directive
    if (!parsedAttr.get(ElementDirectiveName.Is)) {
        ctx.throwAtLocation(
            ParserDiagnostics.LWC_COMPONENT_TAG_WITHOUT_IS_DIRECTIVE,
            ast.sourceLocation(parse5ElmLocation)
        );
    }

    return ast.lwcComponent(parse5Elm.tagName as LwcTagName.Component, parse5ElmLocation);
}

function parseLwcElementAsBuiltIn(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    _parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5Token.ElementLocation
): Element {
    const { tagName: tag, namespaceURI } = parse5Elm;
    // Certain tag names that start with lwc:* are signals to the compiler for special behavior.
    // These tag names are listed in LwcTagNames in types.ts.
    // Issue a warning when component authors use an unrecognized lwc:* tag.
    ctx.warnAtLocation(
        ParserDiagnostics.UNSUPPORTED_LWC_TAG_NAME,
        ast.sourceLocation(parse5ElmLocation),
        [tag]
    );

    return ast.element(tag, namespaceURI, parse5ElmLocation);
}

function parseChildren(
    ctx: ParserCtx,
    parse5Parent: parse5Tools.Element,
    parent: ParentNode,
    parse5ParentLocation: parse5Token.ElementLocation
): void {
    let container: parse5Tools.ParentNode = parse5Parent;
    // `content` isn't nullable but we need to keep the optional chaining
    // until parse5/tools also asserts that `content` is set. It should be
    // impossible to have nullish `content`, but templates in SVG can cause it
    if (parse5Tools.isTemplateNode(parse5Parent) && parse5Parent.content?.childNodes.length > 0) {
        container = parse5Parent.content;
    }
    const children = container.childNodes;

    ctx.beginSiblingScope();
    for (const child of children) {
        ctx.withErrorRecovery(() => {
            if (parse5Tools.isElementNode(child)) {
                ctx.beginElementScope();
                parseElement(ctx, child, parent, parse5ParentLocation);

                // If we're parsing a chain of if/elseif/else nodes, any node other than
                // an else-if node ends the chain.
                const node = ctx.endElementScope();
                if (
                    node &&
                    ctx.isParsingSiblingIfBlock() &&
                    !ast.isIfBlock(node) &&
                    !ast.isElseifBlock(node)
                ) {
                    ctx.endIfChain();
                }
            } else if (parse5Tools.isTextNode(child)) {
                const textNodes = parseText(ctx, child);
                parent.children.push(...textNodes);
                // Non whitespace text nodes end any if chain we may be parsing
                if (ctx.isParsingSiblingIfBlock() && textNodes.length > 0) {
                    ctx.endIfChain();
                }
            } else if (parse5Tools.isCommentNode(child)) {
                const commentNode = parseComment(child);
                parent.children.push(commentNode);
                // If preserveComments is enabled, comments become syntactically meaningful and
                // end any if chain we may be parsing
                if (ctx.isParsingSiblingIfBlock() && ctx.preserveComments) {
                    ctx.endIfChain();
                }
            }
        });
    }
    ctx.endSiblingScope();
}

function parseText(ctx: ParserCtx, parse5Text: parse5Tools.TextNode): Text[] {
    const parsedTextNodes: Text[] = [];
    const location = parse5Text.sourceCodeLocation;

    /* istanbul ignore if */
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

    // TODO [#3370]: remove experimental template expression flag
    if (ctx.config.experimentalComplexExpressions && isExpression(rawText)) {
        // Implementation of the lexer ensures that each text-node template expression
        // will be contained in its own text node. Adjacent static text will be in
        // separate text nodes.
        const preparsedExpression = ctx.preparsedJsExpressions!.get(location.startOffset);
        if (!preparsedExpression) {
            throw new Error('Implementation error: cannot find preparsed template expression');
        }

        const value = {
            ...preparsedExpression,
            location: ast.sourceLocation(location),
        };
        return [ast.text(rawText, value, location)];
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

        parsedTextNodes.push(ast.text(token, value, location));
    }

    return parsedTextNodes;
}

function parseComment(parse5Comment: parse5Tools.CommentNode): Comment {
    const location = parse5Comment.sourceCodeLocation;

    /* istanbul ignore if */
    if (!location) {
        // Parse5 will recover from invalid HTML. When this happens the node's sourceCodeLocation will be undefined.
        // https://github.com/inikulin/parse5/blob/master/packages/parse5/docs/options/parser-options.md#sourcecodelocationinfo
        // This is a defensive check as this should never happen for CommentNode.
        throw new Error(
            'An internal parsing error occurred during node creation; a comment node was found without a sourceCodeLocation.'
        );
    }

    return ast.comment(parse5Comment.data, decodeTextContent(parse5Comment.data), location);
}

function getTemplateRoot(
    ctx: ParserCtx,
    documentFragment: parse5Tools.DocumentFragment
): parse5Tools.Element {
    // Filter all the empty text nodes
    const validRoots = documentFragment.childNodes.filter(
        (child) =>
            parse5Tools.isElementNode(child) ||
            (parse5Tools.isTextNode(child) && child.value.trim().length)
    );

    if (validRoots.length > 1) {
        const duplicateRoot = validRoots[1].sourceCodeLocation ?? undefined;
        ctx.throw(
            ParserDiagnostics.MULTIPLE_ROOTS_FOUND,
            [],
            duplicateRoot ? ast.sourceLocation(duplicateRoot) : duplicateRoot ?? undefined
        );
    }

    const [root] = validRoots;

    if (!root || !parse5Tools.isElementNode(root)) {
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
    parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    parent: ParentNode,
    parsedAttr: ParsedAttribute
): If | undefined {
    const ifAttributes = parsedAttr.pickAll(IF_RE);
    if (ifAttributes.length === 0) {
        return;
    }

    for (let i = 1; i < ifAttributes.length; i++) {
        ctx.warnAtLocation(
            ParserDiagnostics.SINGLE_IF_DIRECTIVE_ALLOWED,
            ast.sourceLocation(parse5ElmLocation),
            [parse5Elm.tagName]
        );
    }

    const ifAttribute = ifAttributes[0];

    // if:true cannot be used with lwc:if, lwc:elseif, lwc:else
    const incompatibleDirective = ctx.findInCurrentElementScope(ast.isConditionalBlock);
    if (incompatibleDirective) {
        ctx.throwAtLocation(
            ParserDiagnostics.LWC_IF_CANNOT_BE_USED_WITH_IF_DIRECTIVE,
            ast.sourceLocation(parse5ElmLocation),
            [ifAttribute.name]
        );
    }

    if (!ast.isExpression(ifAttribute.value)) {
        ctx.throwOnNode(ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION, ifAttribute);
    }

    const [, modifier] = ifAttribute.name.split(':');
    if (!VALID_IF_MODIFIER.has(modifier)) {
        ctx.throwOnNode(ParserDiagnostics.UNEXPECTED_IF_MODIFIER, ifAttribute, [modifier]);
    }

    const node = ast.ifNode(
        modifier,
        ifAttribute.value,
        ast.sourceLocation(parse5ElmLocation),
        ifAttribute.location
    );

    ctx.addNodeCurrentElementScope(node);
    parent.children.push(node);

    return node;
}

function parseIfBlock(
    ctx: ParserCtx,
    _parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    parent: ParentNode,
    parsedAttr: ParsedAttribute
): IfBlock | undefined {
    const ifBlockAttribute = parsedAttr.pick('lwc:if');
    if (!ifBlockAttribute) {
        return;
    }

    if (!ast.isExpression(ifBlockAttribute.value)) {
        ctx.throwOnNode(
            ParserDiagnostics.IF_BLOCK_DIRECTIVE_SHOULD_BE_EXPRESSION,
            ifBlockAttribute
        );
    }

    // An if block always starts a new chain.
    if (ctx.isParsingSiblingIfBlock()) {
        ctx.endIfChain();
    }

    const ifNode = ast.ifBlockNode(
        ifBlockAttribute.value,
        ast.sourceLocation(parse5ElmLocation),
        ifBlockAttribute.location
    );

    ctx.addNodeCurrentElementScope(ifNode);
    ctx.beginIfChain(ifNode);
    parent.children.push(ifNode);

    return ifNode;
}

function parseElseifBlock(
    ctx: ParserCtx,
    _parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    _parent: ParentNode,
    parsedAttr: ParsedAttribute
): ElseifBlock | undefined {
    const elseifBlockAttribute = parsedAttr.pick('lwc:elseif');
    if (!elseifBlockAttribute) {
        return;
    }

    const hasIfBlock = ctx.findInCurrentElementScope(ast.isIfBlock);
    if (hasIfBlock) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_IF_BLOCK_DIRECTIVE_WITH_CONDITIONAL,
            ast.sourceLocation(parse5ElmLocation),
            [elseifBlockAttribute.name]
        );
    }

    if (!ast.isExpression(elseifBlockAttribute.value)) {
        ctx.throwOnNode(
            ParserDiagnostics.ELSEIF_BLOCK_DIRECTIVE_SHOULD_BE_EXPRESSION,
            elseifBlockAttribute
        );
    }

    const conditionalParent = ctx.getSiblingIfNode();
    if (!conditionalParent || !ast.isConditionalParentBlock(conditionalParent)) {
        ctx.throwAtLocation(
            ParserDiagnostics.LWC_IF_SCOPE_NOT_FOUND,
            ast.sourceLocation(parse5ElmLocation),
            [elseifBlockAttribute.name]
        );
    }

    const elseifNode = ast.elseifBlockNode(
        elseifBlockAttribute.value,
        ast.sourceLocation(parse5ElmLocation),
        elseifBlockAttribute.location
    );

    // Attach the node as a child of the preceding IfBlock
    ctx.addNodeCurrentElementScope(elseifNode);
    ctx.appendToIfChain(elseifNode);
    conditionalParent.else = elseifNode;

    return elseifNode;
}

function parseElseBlock(
    ctx: ParserCtx,
    _parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    _parent: ParentNode,
    parsedAttr: ParsedAttribute
): ElseBlock | undefined {
    const elseBlockAttribute = parsedAttr.pick('lwc:else');
    if (!elseBlockAttribute) {
        return;
    }

    // Cannot be used with lwc:if on the same element
    const hasIfBlock = ctx.findInCurrentElementScope(ast.isIfBlock);
    if (hasIfBlock) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_IF_BLOCK_DIRECTIVE_WITH_CONDITIONAL,
            ast.sourceLocation(parse5ElmLocation),
            [elseBlockAttribute.name]
        );
    }

    // Cannot be used with lwc:elseif on the same element
    const hasElseifBlock = ctx.findInCurrentElementScope(ast.isElseifBlock);
    if (hasElseifBlock) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_ELSEIF_BLOCK_DIRECTIVE_WITH_CONDITIONAL,
            ast.sourceLocation(parse5ElmLocation),
            [elseBlockAttribute.name]
        );
    }

    // Must be used immediately after an lwc:if or lwc:elseif
    const conditionalParent = ctx.getSiblingIfNode();
    if (!conditionalParent || !ast.isConditionalParentBlock(conditionalParent)) {
        ctx.throwAtLocation(
            ParserDiagnostics.LWC_IF_SCOPE_NOT_FOUND,
            ast.sourceLocation(parse5ElmLocation),
            [elseBlockAttribute.name]
        );
    }

    // Must not have a value
    if (!ast.isBooleanLiteral(elseBlockAttribute.value)) {
        ctx.throwAtLocation(
            ParserDiagnostics.ELSE_BLOCK_DIRECTIVE_CANNOT_HAVE_VALUE,
            ast.sourceLocation(parse5ElmLocation)
        );
    }

    const elseNode = ast.elseBlockNode(
        ast.sourceLocation(parse5ElmLocation),
        elseBlockAttribute.location
    );

    // Attach the node as a child of the preceding IfBlock
    ctx.addNodeCurrentElementScope(elseNode);

    // Avoid ending the if-chain until we finish parsing all children
    ctx.appendToIfChain(elseNode);
    conditionalParent.else = elseNode;

    return elseNode;
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
    const lwcRenderModeAttribute = parsedAttr.pick(RootDirectiveName.RenderMode);
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
    ctx.instrumentation?.incrementCounter(CompilerMetrics.LWCRenderModeDirective);
}

function applyLwcPreserveCommentsDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    root: Root
): void {
    const lwcPreserveCommentAttribute = parsedAttr.pick(RootDirectiveName.PreserveComments);
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

const LWC_DIRECTIVE_PROCESSORS = [
    applyLwcExternalDirective,
    applyLwcDynamicDirective,
    applyLwcIsDirective,
    applyLwcDomDirective,
    applyLwcInnerHtmlDirective,
    applyRefDirective,
    applyLwcSpreadDirective,
    applyLwcSlotBindDirective,
];

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
    if (parsedAttr.get(RootDirectiveName.RenderMode)) {
        ctx.throwOnNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            RootDirectiveName.RenderMode,
            `<${element.name}>`,
        ]);
    }

    if (parsedAttr.get(RootDirectiveName.PreserveComments)) {
        ctx.throwOnNode(ParserDiagnostics.UNKNOWN_LWC_DIRECTIVE, element, [
            RootDirectiveName.PreserveComments,
            `<${element.name}>`,
        ]);
    }

    // Bind LWC directives to element
    for (const matchAndApply of LWC_DIRECTIVE_PROCESSORS) {
        matchAndApply(ctx, parsedAttr, element);
    }
}

function applyLwcSlotBindDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;
    const slotBindAttribute = parsedAttr.pick(ElementDirectiveName.SlotBind);
    if (!slotBindAttribute) {
        return;
    }

    if (!ast.isSlot(element)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_SLOT_BIND_NON_SLOT_ELEMENT, element, [
            `<${tag}>`,
        ]);
    }

    const { value: slotBindValue } = slotBindAttribute;
    if (!ast.isExpression(slotBindValue)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_SLOT_BIND_LITERAL_PROP, element, [
            `<${tag}>`,
        ]);
    }

    element.directives.push(ast.slotBindDirective(slotBindValue, slotBindAttribute.location));
}

function applyLwcSpreadDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;

    const lwcSpread = parsedAttr.pick(ElementDirectiveName.Spread);
    if (!lwcSpread) {
        return;
    }

    const { value: lwcSpreadAttr } = lwcSpread;
    if (!ast.isExpression(lwcSpreadAttr)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_SPREAD_LITERAL_PROP, element, [`<${tag}>`]);
    }

    element.directives.push(ast.spreadDirective(lwcSpreadAttr, lwcSpread.location));
}

function applyLwcExternalDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
) {
    const lwcExternalAttribute = parsedAttr.pick(ElementDirectiveName.External);
    if (!lwcExternalAttribute) {
        return;
    }

    if (!ast.isExternalComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_EXTERNAL_ON_NON_CUSTOM_ELEMENT, element, [
            `<${element.name}>`,
        ]);
    }

    if (!ast.isBooleanLiteral(lwcExternalAttribute.value)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_EXTERNAL_VALUE, element, [
            `<${element.name}>`,
        ]);
    }
}

function applyLwcDynamicDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;

    const lwcDynamicAttribute = parsedAttr.pick(ElementDirectiveName.Dynamic);
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

    const { value: lwcDynamicAttr, location } = lwcDynamicAttribute;
    if (!ast.isExpression(lwcDynamicAttr)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_DYNAMIC_LITERAL_PROP, element, [`<${tag}>`]);
    }

    // lwc:dynamic will be deprecated in 246, issue a warning when usage is detected.
    ctx.warnOnNode(ParserDiagnostics.DEPRECATED_LWC_DYNAMIC_ATTRIBUTE, element);
    ctx.instrumentation?.incrementCounter(CompilerMetrics.LWCDynamicDirective);

    element.directives.push(ast.dynamicDirective(lwcDynamicAttr, location));
}

function applyLwcIsDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const { name: tag } = element;

    const lwcIsAttribute = parsedAttr.pick(ElementDirectiveName.Is);
    if (!lwcIsAttribute) {
        return;
    }

    if (!ast.isLwcComponent(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_IS_INVALID_ELEMENT, element, [`<${tag}>`]);
    }

    const { value: lwcIsAttrValue, location } = lwcIsAttribute;
    if (!ast.isExpression(lwcIsAttrValue)) {
        ctx.throwOnNode(ParserDiagnostics.INVALID_LWC_IS_DIRECTIVE_VALUE, element, [
            lwcIsAttrValue.value,
        ]);
    }

    element.directives.push(ast.lwcIsDirective(lwcIsAttrValue, location));
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
    const lwcInnerHtmlDirective = parsedAttr.pick(ElementDirectiveName.InnerHTML);

    if (!lwcInnerHtmlDirective) {
        return;
    }

    if (ast.isComponent(element) || ast.isLwcComponent(element)) {
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

function applyRefDirective(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    element: BaseElement
): void {
    const lwcRefDirective = parsedAttr.pick(ElementDirectiveName.Ref);

    if (!lwcRefDirective) {
        return;
    }

    if (ast.isSlot(element)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_REF_INVALID_ELEMENT, element, [`<${element.name}>`]);
    }

    if (isInIteration(ctx)) {
        ctx.throwOnNode(ParserDiagnostics.LWC_REF_INVALID_LOCATION_INSIDE_ITERATION, element, [
            `<${element.name}>`,
        ]);
    }

    const { value: refName } = lwcRefDirective;

    if (!ast.isStringLiteral(refName) || refName.value.length === 0) {
        ctx.throwOnNode(ParserDiagnostics.LWC_REF_INVALID_VALUE, element, [`<${element.name}>`]);
    }

    element.directives.push(ast.refDirective(refName, lwcRefDirective.location));
}

function parseForEach(
    ctx: ParserCtx,
    _parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    parent: ParentNode,
    parsedAttr: ParsedAttribute
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

        const node = ast.forEach(
            forEachAttribute.value,
            ast.sourceLocation(parse5ElmLocation),
            forEachAttribute.location,
            item,
            index
        );

        ctx.addNodeCurrentElementScope(node);
        parent.children.push(node);

        return node;
    } else if (forEachAttribute || forItemAttribute) {
        ctx.throwAtLocation(
            ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
            ast.sourceLocation(parse5ElmLocation)
        );
    }
}

function parseForOf(
    ctx: ParserCtx,
    _parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    parent: ParentNode,
    parsedAttr: ParsedAttribute
): ForOf | undefined {
    const iteratorExpression = parsedAttr.pick(ITERATOR_RE);
    if (!iteratorExpression) {
        return;
    }

    const hasForEach = ctx.findInCurrentElementScope(ast.isForEach);
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

    const node = ast.forOf(
        iteratorExpression.value,
        iterator,
        ast.sourceLocation(parse5ElmLocation),
        iteratorExpression.location
    );

    ctx.addNodeCurrentElementScope(node);
    parent.children.push(node);

    return node;
}

function parseScopedSlotFragment(
    ctx: ParserCtx,
    parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation,
    parent: ParentNode,
    parsedAttr: ParsedAttribute
): ScopedSlotFragment | undefined {
    const slotDataAttr = parsedAttr.pick(ElementDirectiveName.SlotData);
    if (!slotDataAttr) {
        return;
    }

    if (parse5Elm.tagName !== 'template') {
        ctx.throwOnNode(ParserDiagnostics.SCOPED_SLOT_DATA_ON_TEMPLATE_ONLY, slotDataAttr);
    }

    // 'lwc:slot-data' cannot be combined with other directives on the same <template> tag
    if (ctx.findInCurrentElementScope(ast.isElementDirective)) {
        ctx.throwAtLocation(
            ParserDiagnostics.SCOPED_SLOTDATA_CANNOT_BE_COMBINED_WITH_OTHER_DIRECTIVE,
            ast.sourceLocation(parse5ElmLocation)
        );
    }

    // <template lwc:slot-data> element should always be the direct child of a custom element
    // The only exception is, a conditional block as parent
    const parentCmp = ctx.findAncestor(
        ast.isComponent,
        ({ current }) => current && ast.isConditionalBlock(current)
    );

    if (!parentCmp) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_PARENT_OF_LWC_SLOT_DATA,
            ast.sourceLocation(parse5ElmLocation)
        );
    }

    const slotDataAttrValue = slotDataAttr.value;
    if (!ast.isStringLiteral(slotDataAttrValue)) {
        ctx.throwOnNode(ParserDiagnostics.SLOT_DATA_VALUE_SHOULD_BE_STRING, slotDataAttr);
    }

    // Extract name (literal or bound) of slot if in case it's a named slot
    const slotAttr = parsedAttr.pick('slot');
    let slotName: Literal | Expression | undefined;
    if (slotAttr) {
        slotName = slotAttr.value;
    }

    const identifier = parseIdentifier(ctx, slotDataAttrValue.value, slotDataAttr.location);
    const node = ast.scopedSlotFragment(
        identifier,
        ast.sourceLocation(parse5ElmLocation),
        slotDataAttr.location,
        slotName ?? ast.literal('')
    );
    ctx.addNodeCurrentElementScope(node);
    parent.children.push(node);
    return node;
}

function applyKey(ctx: ParserCtx, parsedAttr: ParsedAttribute, element: BaseElement): void {
    const { name: tag } = element;
    const keyAttribute = parsedAttr.pick(ElementDirectiveName.Key);

    if (keyAttribute) {
        if (!ast.isExpression(keyAttribute.value)) {
            ctx.throwOnNode(ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION, keyAttribute);
        }

        const forOfParent = getForOfParent(ctx);
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

        if (forOfParent || forEachParent) {
            element.directives.push(ast.keyDirective(keyAttribute.value, keyAttribute.location));
        } else {
            ctx.warnOnNode(ParserDiagnostics.KEY_SHOULD_BE_IN_ITERATION, keyAttribute, [tag]);
        }
    } else if (isInIteratorElement(ctx)) {
        ctx.throwOnNode(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, element, [tag]);
    }
}

const RESTRICTED_DIRECTIVES_ON_SLOT = Object.values(TemplateDirectiveName).join(', ');
const ALLOWED_SLOT_ATTRIBUTES = [
    ElementDirectiveName.Key,
    ElementDirectiveName.SlotBind,
    'name',
    'slot',
];
const ALLOWED_SLOT_ATTRIBUTES_SET = new Set<string>(ALLOWED_SLOT_ATTRIBUTES);
function parseSlot(
    ctx: ParserCtx,
    parsedAttr: ParsedAttribute,
    parse5ElmLocation: parse5Token.ElementLocation
): Slot {
    const location = ast.sourceLocation(parse5ElmLocation);

    const isScopedSlot = !isUndefined(parsedAttr.get(ElementDirectiveName.SlotBind));
    if (isScopedSlot && ctx.renderMode !== LWCDirectiveRenderMode.light) {
        ctx.throwAtLocation(ParserDiagnostics.SCOPED_SLOT_BIND_IN_LIGHT_DOM_ONLY, location);
    }

    // Restrict specific template directives on <slot> element
    const hasDirectives = ctx.findInCurrentElementScope(ast.isElementDirective);
    if (hasDirectives) {
        ctx.throwAtLocation(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, location, [
            RESTRICTED_DIRECTIVES_ON_SLOT,
        ]);
    }

    // Can't handle slots in applySlot because it would be too late for class and style attrs
    if (ctx.renderMode === LWCDirectiveRenderMode.light) {
        const invalidAttrs = parsedAttr
            .getAttributes()
            .filter(({ name }) => !ALLOWED_SLOT_ATTRIBUTES_SET.has(name))
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
                ALLOWED_SLOT_ATTRIBUTES.join(', '),
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

    const seenInContext = ctx.hasSeenSlot(name);
    ctx.addSeenSlot(name);

    if (seenInContext) {
        // Scoped slots do not allow duplicate or mixed slots
        // https://rfcs.lwc.dev/rfcs/lwc/0118-scoped-slots-light-dom#restricting-ambigious-bindings
        // https://rfcs.lwc.dev/rfcs/lwc/0118-scoped-slots-light-dom#invalid-usages
        // Note: ctx.seenScopedSlots is not "if" context aware and it does not need to be.
        //   It is only responsible to determine if a scoped slot with the same name has been seen prior.
        if (ctx.seenScopedSlots.has(name)) {
            // Differentiate between mixed type or duplicate scoped slot
            const errorInfo = isScopedSlot
                ? ParserDiagnostics.NO_DUPLICATE_SCOPED_SLOT // error
                : ParserDiagnostics.NO_MIXED_SLOT_TYPES; // error
            ctx.throwAtLocation(errorInfo, location, [name === '' ? 'default' : `name="${name}"`]);
        } else {
            // Differentiate between mixed type or duplicate standard slot
            const errorInfo = isScopedSlot
                ? ParserDiagnostics.NO_MIXED_SLOT_TYPES // error
                : ParserDiagnostics.NO_DUPLICATE_SLOTS; // warning
            // for standard slots, preserve old behavior of warnings
            ctx.warnAtLocation(errorInfo, location, [name === '' ? 'default' : `name="${name}"`]);
        }
    } else if (!isScopedSlot && isInIteration(ctx)) {
        // Scoped slots are allowed to be placed in iteration blocks
        ctx.warnAtLocation(ParserDiagnostics.NO_SLOTS_IN_ITERATOR, location, [
            name === '' ? 'default' : `name="${name}"`,
        ]);
    }

    if (isScopedSlot) {
        ctx.seenScopedSlots.add(name);
    }

    return ast.slot(name, parse5ElmLocation);
}

function applyAttributes(ctx: ParserCtx, parsedAttr: ParsedAttribute, element: BaseElement): void {
    const { name: tag } = element;
    const attributes = parsedAttr.getAttributes();
    const properties: Map<string, Property> = new Map();

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

        // The leading '-' is necessary to preserve attribute to property reflection as the '-' is a signal
        // to the compiler to convert the first character following it to an uppercase.
        // This is needed for property names with an @api annotation because they can begin with an upper case character.
        if (!/^-*[a-z]|^[_$]/.test(name)) {
            ctx.throwOnNode(ParserDiagnostics.ATTRIBUTE_NAME_STARTS_WITH_INVALID_CHARACTER, attr, [
                name,
                tag,
            ]);
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

        // the if branch handles
        // 1. All attributes for standard elements except 1 case are handled as attributes
        // 2. For custom elements, only key, slot and data are handled as attributes, rest as properties
        if (isAttribute(element, name)) {
            element.attributes.push(attr);
        } else {
            const propName = attributeToPropertyName(name);
            const existingProp = properties.get(propName);
            if (existingProp) {
                ctx.warnOnNode(ParserDiagnostics.DUPLICATE_ATTR_PROP_TRANSFORM, attr, [
                    existingProp.attributeName,
                    name,
                    propName,
                ]);
            }
            properties.set(propName, ast.property(propName, name, attr.value, attr.location));

            parsedAttr.pick(name);
        }
    }

    element.properties.push(...properties.values());
}

function validateRoot(ctx: ParserCtx, parsedAttr: ParsedAttribute, root: Root): void {
    const rootAttrs = parsedAttr.getAttributes();
    if (rootAttrs.length) {
        ctx.throwOnNode(ParserDiagnostics.ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES, root, [
            rootAttrs.map(({ name }) => name).join(','),
        ]);
    }

    if (!root.location.endTag) {
        ctx.throwOnNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, root, ['template']);
    }
}

function validateElement(
    ctx: ParserCtx,
    element: BaseElement,
    parse5Elm: parse5Tools.Element
): void {
    const { tagName: tag, namespaceURI: namespace } = parse5Elm;

    // Check if a non-void element has a matching closing tag.
    //
    // Note: Parse5 currently fails to collect end tag location for element with a tag name
    // containing an upper case character (inikulin/parse5#352).
    const hasClosingTag = Boolean(element.location.endTag);
    if (
        !isVoidElement(tag, namespace) &&
        !hasClosingTag &&
        tag === tag.toLocaleLowerCase() &&
        namespace === HTML_NAMESPACE
    ) {
        ctx.throwOnNode(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, element, [tag]);
    }

    if (tag === 'style' && namespace === HTML_NAMESPACE) {
        ctx.throwOnNode(ParserDiagnostics.STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE, element);
    } else {
        const isNotAllowedHtmlTag = DISALLOWED_HTML_TAGS.has(tag);
        if (namespace === HTML_NAMESPACE && isNotAllowedHtmlTag) {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE, element, [tag]);
        }

        const isNotAllowedSvgTag = !SUPPORTED_SVG_TAGS.has(tag);
        if (namespace === SVG_NAMESPACE && isNotAllowedSvgTag) {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE, element, [tag]);
        }

        const isNotAllowedMathMlTag = DISALLOWED_MATHML_TAGS.has(tag);
        if (namespace === MATHML_NAMESPACE && isNotAllowedMathMlTag) {
            ctx.throwOnNode(ParserDiagnostics.FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE, element, [
                tag,
            ]);
        }

        const isKnownTag =
            ast.isComponent(element) ||
            ast.isExternalComponent(element) ||
            ast.isBaseLwcElement(element) ||
            KNOWN_HTML_AND_SVG_ELEMENTS.has(tag) ||
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
    template: parse5Tools.Template,
    parse5ElmLocation: parse5Token.ElementLocation
): void {
    const location = ast.sourceLocation(parse5ElmLocation);

    // Empty templates not allowed outside of root
    if (!template.attrs.length) {
        ctx.throwAtLocation(ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE, location);
    }

    if (parsedAttr.get(ElementDirectiveName.External)) {
        ctx.throwAtLocation(
            ParserDiagnostics.INVALID_LWC_EXTERNAL_ON_NON_CUSTOM_ELEMENT,
            location,
            ['<template>']
        );
    }

    if (parsedAttr.get(ElementDirectiveName.InnerHTML)) {
        ctx.throwAtLocation(ParserDiagnostics.LWC_INNER_HTML_INVALID_ELEMENT, location, [
            '<template>',
        ]);
    }

    if (parsedAttr.get(ElementDirectiveName.Ref)) {
        ctx.throwAtLocation(ParserDiagnostics.LWC_REF_INVALID_ELEMENT, location, ['<template>']);
    }

    if (parsedAttr.get(ElementDirectiveName.Is)) {
        ctx.throwAtLocation(ParserDiagnostics.LWC_IS_INVALID_ELEMENT, location, ['<template>']);
    }

    // At this point in the parsing all supported attributes from a non root template element
    // should have been removed from ParsedAttribute and all other attributes will be ignored.
    const invalidTemplateAttributes = parsedAttr.getAttributes();
    if (invalidTemplateAttributes.length) {
        ctx.warnAtLocation(ParserDiagnostics.INVALID_TEMPLATE_ATTRIBUTE, location, [
            invalidTemplateAttributes.map((attr) => attr.name).join(', '),
        ]);
    }
}

function validateChildren(ctx: ParserCtx, element?: BaseElement, directive?: ParentNode): void {
    if (directive) {
        // Find a scoped slot fragment node if it exists
        const slotFragment = ctx.findAncestor(
            ast.isScopedSlotFragment,
            ({ current }) => current && ast.isComponent,
            directive
        );

        // If the current directive is a slotFragment or the descendent of a slotFragment, additional
        // validations are required
        if (!isNull(slotFragment)) {
            /*
             * A slot fragment cannot contain comment or text node as children.
             * Comment and Text nodes are always slotted to the default slot, in other words these
             * nodes cannot be assigned to a named slot. This restriction is in place to ensure that
             * in the future if slotting is done via slot assignment API, we won't have named scoped
             * slot usecase that cannot be supported.
             */
            directive.children.forEach((child) => {
                if ((ctx.preserveComments && ast.isComment(child)) || ast.isText(child)) {
                    ctx.throwOnNode(ParserDiagnostics.NON_ELEMENT_SCOPED_SLOT_CONTENT, child);
                }
            });
        }
    }

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
        const { attributeName: attrName, value } = prop;

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
    parse5Elm: parse5Tools.Element,
    parse5ElmLocation: parse5Token.ElementLocation
): ParsedAttribute {
    const parsedAttrs = new ParsedAttribute();
    const { attrs: attributes, tagName } = parse5Elm;
    const { attrs: attrLocations } = parse5ElmLocation;

    for (const attr of attributes) {
        const attrLocation = attrLocations?.[attributeName(attr).toLowerCase()];
        /* istanbul ignore if */
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
    attribute: parse5Token.Attribute,
    attributeLocation: parse5Token.Location
): Attribute {
    // Convert attribute name to lowercase because the location map keys follow the algorithm defined in the spec
    // https://wicg.github.io/controls-list/html-output/multipage/syntax.html#attribute-name-state
    const rawAttribute = ctx.getSource(attributeLocation.startOffset, attributeLocation.endOffset);
    const location = ast.sourceLocation(attributeLocation);

    // parse5 automatically converts the casing from camel case to all lowercase. If the attribute name
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

    // TODO [#3370]: If complex template expressions are adopted, `preparsedJsExpressions`
    // should be checked. However, to avoid significant complications in the internal types,
    // arising from supporting both implementations simultaneously, we will re-parse the
    // expression here when `ctx.config.experimentalComplexExpressions` is true.
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

function getForOfParent(ctx: ParserCtx): ForOf | null {
    return ctx.findAncestor(ast.isForOf, ({ parent }) => parent && !ast.isBaseElement(parent));
}

function getForEachParent(ctx: ParserCtx): ForEach | null {
    return ctx.findAncestor(ast.isForEach, ({ parent }) => parent && !ast.isBaseElement(parent));
}

function isInIteratorElement(ctx: ParserCtx): boolean {
    return !!(getForOfParent(ctx) || getForEachParent(ctx));
}
