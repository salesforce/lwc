import * as parse5 from 'parse5-with-errors';

import {
    treeAdapter,
    parseHTML,
    traverseHTML,
    getSource,
    cleanTextNode,
    decodeTextContent,
} from './html';

import {
    isAttribute,
    getAttribute,
    removeAttribute,
    attributeName,
    normalizeAttributeValue,
    isValidHTMLAttribute,
    attributeToPropertyName,
    isTabIndexAttribute,
    isValidTabIndexAttributeValue,
} from './attribute';

import {
    isExpression,
    parseExpression,
    parseIdentifier,
    isIteratorElement,
    getForOfParent,
    getForEachParent,
} from './expression';

import {
    parseStyleText,
    parseClassNames,
} from './style';

import {
    createElement,
    isCustomElement,
    createText,
} from '../shared/ir';

import {
    IRNode,
    IRElement,
    IRAttribute,
    IRAttributeType,
    TemplateIdentifier,
    ForIterator,
    IRExpressionAttribute,
    ForEach,
    TemplateExpression,
    LWCDirectiveDomMode,
} from '../shared/types';

import {
    getModuleMetadata
} from '../metadata/metadata';

import {
    bindExpression,
} from '../shared/scope';

import State from '../state';

import {
    EXPRESSION_RE,
    IF_RE,
    VALID_IF_MODIFIER,
    EVENT_HANDLER_RE,
    EVENT_HANDLER_NAME_RE,
    HTML_TAG_BLACKLIST,
    ITERATOR_RE,
    DASHED_TAGNAME_ELEMENT_SET,
    SVG_TAG_WHITELIST,
    SVG_NAMESPACE_URI,
    HTML_NAMESPACE_URI,
} from './constants';
import { isMemberExpression, isIdentifier } from 'babel-types';
import {
    CompilerDiagnostic,
    generateCompilerDiagnostic,
    LWCErrorInfo,
    normalizeToDiagnostic,
    ParserDiagnostics
} from 'lwc-errors';
import { isUndefined } from 'util';

function getKeyGenerator() {
    let count = 1;
    return () => count++;
}

function isStyleElement(element: IRElement) {
    return element.tag !== 'style';
}

function attributeExpressionReferencesForOfIndex(attribute: IRExpressionAttribute, forOf: ForIterator): boolean {
    const { value } = attribute;
    // if not an expression, it is not referencing iterator index
    if (!isMemberExpression(value)) {
        return false;
    }

    const { object, property } = value;
    if (!isIdentifier(object) || !isIdentifier(property)) {
        return false;
    }

    if (forOf.iterator.name !== object.name) {
        return false;
    }

    return property.name === 'index';
}

function attributeExpressionReferencesForEachIndex(attribute: IRExpressionAttribute, forEach: ForEach): boolean {
    const { index } = forEach;
    const { value } = attribute;

    // No index defined on foreach
    if (!index || !isIdentifier(index) || !isIdentifier(value)) {
        return false;
    }

    return index.name === value.name;
}

export default function parse(source: string, state: State): {
    root?: IRElement | undefined,
    warnings: CompilerDiagnostic[],
} {
    const warnings: CompilerDiagnostic[] = [];
    const generateKey = getKeyGenerator();

    const { fragment, errors: parsingErrors } = parseHTML(source);
    if (parsingErrors.length) {
        return { warnings: parsingErrors };
    }

    const templateRoot = getTemplateRoot(fragment);
    if (!templateRoot) {
        return { warnings };
    }

    let root: any;
    let parent: IRElement;
    const stack: IRElement[] = [];

    traverseHTML(templateRoot, {
        Element: {
            enter(node) {
                const elementNode = node as parse5.AST.Default.Element;

                const element = createElement(elementNode.tagName, node);
                element.attrsList = elementNode.attrs;
                element.key = generateKey();

                if (!root) {
                    root = element;
                } else {
                    element.parent = parent;
                    parent.children.push(element);
                }

                applyStylesheet(element, elementNode);
                applyForEach(element);
                applyIterator(element);
                applyIf(element);
                applyStyle(element);
                applyHandlers(element);
                applyLocator(element);
                applyComponent(element);
                applySlot(element);
                applyKey(element, elementNode.__location);

                parent = element;
                stack.push(element);
            },
            exit() {
                const element = stack.pop() as IRElement;
                // Apply lwc directive on way out to ensure the element is empty
                applyLwcDirective(element);
                validateStylesheet(element);
                applyAttributes(element);
                validateElement(element);
                validateAttributes(element);
                validateProperties(element);
                collectMetadata(element);

                parent = stack[stack.length - 1];
            },
        },

        Text: {
            enter(node: parse5.AST.Default.TextNode) {
                // Extract the raw source to avoid HTML entity decoding done by parse5
                // TODO: Update parse5-with-error to match version used for jsdom (interface for ElementLocation changed)
                const location = node.__location as parse5.MarkupData.Location;

                const { startOffset, endOffset } = location;
                const rawText = cleanTextNode(source.slice(startOffset, endOffset));

                if (!rawText.trim().length) {
                    return;
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
                            value = parseTemplateExpression(parent, token);
                        } catch (error) {
                            addDiagnostic(normalizeToDiagnostic(ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR, error, {
                                location: normalizeLocation(location)
                            }));
                            return;
                        }
                    } else {
                        value = decodeTextContent(token);
                    }

                    const textNode = createText(node, value);

                    textNode.parent = parent;
                    parent.children.push(textNode);
                }

            },
        },
    });
    validateState(state);

    function getTemplateRoot(
        documentFragment: parse5.AST.Default.DocumentFragment,
    ): parse5.AST.Default.Element | undefined {
        // Filter all the empty text nodes
        const validRoots = documentFragment.childNodes.filter((child) => (
            treeAdapter.isElementNode(child) ||
            treeAdapter.isTextNode(child) && treeAdapter.getTextNodeContent(child).trim().length
        ));

        if (validRoots.length > 1) {
            warnOnElement(ParserDiagnostics.MULTIPLE_ROOTS_FOUND, documentFragment.childNodes[1]);
        }

        const templateTag = documentFragment.childNodes.find((child) => (
            treeAdapter.isElementNode(child)
        ));

        if (!templateTag) {
            warnAt(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
        } else {
            return templateTag as parse5.AST.Default.Element;
        }
    }

    function applyStyle(element: IRElement) {
        const classAttribute = getTemplateAttribute(element, 'class');
        if (classAttribute) {
            removeAttribute(element, 'class');

            if (classAttribute.type === IRAttributeType.String) {
                element.classMap = parseClassNames(classAttribute.value);
            } else if (classAttribute.type === IRAttributeType.Expression) {
                element.className = classAttribute.value;
            }
        }

        const styleAttribute = getTemplateAttribute(element, 'style');
        if (styleAttribute) {
            removeAttribute(element, 'style');

            if (styleAttribute.type === IRAttributeType.Expression) {
                element.style = styleAttribute.value;
            } else if (styleAttribute.type === IRAttributeType.String) {
                element.styleMap = parseStyleText(styleAttribute.value);
            }
        }
    }

    function applyHandlers(element: IRElement) {
        let eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        while (eventHandlerAttribute) {
            removeAttribute(element, eventHandlerAttribute.name);

            if (eventHandlerAttribute.type !== IRAttributeType.Expression) {
                return warnAt(ParserDiagnostics.EVENT_HANDLER_SHOULD_BE_EXPRESSION, [], eventHandlerAttribute.location);
            }

            let eventName = eventHandlerAttribute.name;
            if (!eventName.match(EVENT_HANDLER_NAME_RE)) {
                return warnAt(ParserDiagnostics.INVALID_EVENT_NAME, [eventName], eventHandlerAttribute.location);
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
                return warnAt(ParserDiagnostics.IF_DIRECTIVE_SHOULD_BE_EXPRESSION, [], ifAttribute.location);
            }

            const [, modifier] = ifAttribute.name.split(':');
            if (!VALID_IF_MODIFIER.has(modifier)) {
                return warnAt(ParserDiagnostics.UNEXPECTED_IF_MODIFIER, [modifier], ifAttribute.location);
            }

            element.if = ifAttribute.value;
            element.ifModifier = modifier;
        }
    }

    function applyLwcDirective(element: IRElement) {
        const lwcDomAttribute = getTemplateAttribute(element, 'lwc:dom');

        if (!lwcDomAttribute) {
            return;
        }

        removeAttribute(element, lwcDomAttribute.name);

        if (isCustomElement(element)) {
            return warnOnElement(ParserDiagnostics.LWC_DOM_INVALID_CUSTOM_ELEMENT, element.__original, [`<${element.tag}>`]);
        }

        if (element.tag === 'slot') {
            return warnOnElement(ParserDiagnostics.LWC_DOM_INVALID_SLOT_ELEMENT, element.__original);
        }

        if (lwcDomAttribute.type !== IRAttributeType.String || LWCDirectiveDomMode.hasOwnProperty(lwcDomAttribute.value) === false) {
            const possibleValues = Object.keys(LWCDirectiveDomMode).map((value) => `"${value}"`).join(', or ');
            return warnOnElement(ParserDiagnostics.LWC_DOM_INVALID_VALUE, element.__original, [possibleValues]);
        }

        if (element.children.length > 0) {
            return warnOnElement(ParserDiagnostics.LWC_DOM_INVALID_CONTENTS, element.__original);
        }

        element.lwc = {
            dom: lwcDomAttribute.value as LWCDirectiveDomMode
        };

    }

    function applyLocator(element: IRElement) {
        const locatorIdAttribute = getTemplateAttribute(element, 'locator:id');
        const locatorContextAttribute = getTemplateAttribute(element, 'locator:context');

        if (!locatorIdAttribute && !locatorContextAttribute) {
            return;
        }

        if (!locatorIdAttribute && locatorContextAttribute) {
            removeAttribute(element, locatorContextAttribute.name);
            return warnOnElement(
                ParserDiagnostics.LOCATOR_CONTEXT_MUST_BE_USED_WITH_LOCATOR_ID,
                element.__original
            );
        }

        if (locatorIdAttribute) {
            removeAttribute(element, locatorIdAttribute.name);
            if (locatorContextAttribute) {
                removeAttribute(element, locatorContextAttribute.name);
            }

            if (locatorIdAttribute.type !== IRAttributeType.String) {
                return warnAt(ParserDiagnostics.LOCATOR_ID_SHOULD_BE_STRING, [], locatorIdAttribute.location);
            }
            const id = locatorIdAttribute.value;

            let context: TemplateExpression | undefined;

            if (locatorContextAttribute !== undefined) {
                if (locatorContextAttribute.type !== IRAttributeType.Expression) {
                    return warnAt(ParserDiagnostics.LOCATOR_CONTEXT_SHOULD_BE_EXPRESSION, [], locatorContextAttribute.location);
                } else {
                    context = locatorContextAttribute.value;
                    if (isMemberExpression(context)) {
                        return warnAt(ParserDiagnostics.LOCATOR_CONTEXT_CANNOT_BE_MEMBER_EXPRESSION, [], locatorContextAttribute.location);
                    }
                }
            }

            element.locator = {
                id,
                context
            };

            return;
        }
    }

    function validateStylesheet(element: IRElement) {
        if (isStyleElement(element)) {
            return;
        }

        if (isUndefined(element.inlineStyles)) {
            warnOnElement(ParserDiagnostics.EMPTY_STYLE_TAG, element.__original);
        }

        const parentElement = element.parent;
        if (!parentElement || parentElement.tag !== 'template' || parentElement.children[0] !== element) {
            warnOnElement(ParserDiagnostics.INVALID_STYLE_TAG_POSITION, element.__original);
        }
    }

    function applyStylesheet(element: IRElement, node: parse5.AST.Default.Element) {
        if (isStyleElement(element)) {
            return;
        }

        const inlineStyles = node.childNodes.reduce((acc, n: any) => acc + n.value.trim(), '');
        element.inlineStyles = inlineStyles;
        node.childNodes = []; // clear the textNodes
    }

    function applyForEach(element: IRElement) {
        const forEachAttribute = getTemplateAttribute(element, 'for:each');
        const forItemAttribute = getTemplateAttribute(element, 'for:item');
        const forIndex = getTemplateAttribute(element, 'for:index');

        if (!forEachAttribute && !forItemAttribute) {
            return;
        } else if (forEachAttribute && forItemAttribute) {
            removeAttribute(element, forEachAttribute.name);
            removeAttribute(element, forItemAttribute.name);

            if (forEachAttribute.type !== IRAttributeType.Expression) {
                return warnAt(ParserDiagnostics.FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION, [], forEachAttribute.location);
            } else if (forItemAttribute.type !== IRAttributeType.String) {
                return warnAt(ParserDiagnostics.FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING, [], forItemAttribute.location);
            }

            let item: TemplateIdentifier;
            try {
                item = parseIdentifier(forItemAttribute.value);
            } catch (error) {
                return addDiagnostic(
                    normalizeToDiagnostic(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, {
                        location: normalizeLocation(forItemAttribute.location)
                    })
                );
            }

            let index: TemplateIdentifier | undefined;
            if (forIndex) {
                removeAttribute(element, forIndex.name);
                if (forIndex.type !== IRAttributeType.String) {
                    return warnAt(ParserDiagnostics.FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING, [], forIndex.location);
                }

                try {
                    index = parseIdentifier(forIndex.value);
                } catch (error) {
                    return addDiagnostic(
                        normalizeToDiagnostic(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, {
                            location: normalizeLocation(forIndex.location)
                        })
                    );
                }
            }

            element.forEach = {
                expression: forEachAttribute.value,
                item,
                index,
            };
        } else {
            return warnOnElement(
                ParserDiagnostics.FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER,
                element.__original,
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
            return warnAt(ParserDiagnostics.DIRECTIVE_SHOULD_BE_EXPRESSION, [iteratorExpression.name], iteratorExpression.location);
        }

        let iterator: TemplateIdentifier;
        try {
            iterator = parseIdentifier(iteratorName);
        } catch (error) {
            return addDiagnostic(
                normalizeToDiagnostic(ParserDiagnostics.IDENTIFIER_PARSING_ERROR, error, {
                    location: normalizeLocation(iteratorExpression.location)
                })
            );
        }

        element.forOf = {
            expression: iteratorExpression.value,
            iterator,
        };

    }

    function applyKey(element: IRElement, location: parse5.MarkupData.ElementLocation | undefined) {
        const keyAttribute = getTemplateAttribute(element, 'key');
        if (keyAttribute) {
            if (keyAttribute.type !== IRAttributeType.Expression) {
                return warnAt(ParserDiagnostics.KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION, [], keyAttribute.location);
            }

            const forOfParent = getForOfParent(element);
            const forEachParent = getForEachParent(element);
            if (forOfParent) {
                if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent.forOf!)) {
                    return warnAt(ParserDiagnostics.KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX, [element.tag], keyAttribute.location);
                }
            } else if (forEachParent) {
                if (attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent.forEach!)) {
                    const name = ('name' in keyAttribute.value) && keyAttribute.value.name;
                    return warnAt(ParserDiagnostics.KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX, [element.tag, name], keyAttribute.location);
                }
            }
            removeAttribute(element, 'key');

            element.forKey = keyAttribute.value;
        } else if (isIteratorElement(element) && element.tag !== 'template') {
            return warnAt(ParserDiagnostics.MISSING_KEY_IN_ITERATOR, [element.tag], location);
        }
    }

    function applyComponent(element: IRElement) {
        const { tag } = element;
        let component: string | undefined;

        if (tag.includes('-') && !DASHED_TAGNAME_ELEMENT_SET.has(tag)) {
            component = tag;
        }

        const isAttr = getTemplateAttribute(element, 'is');
        if (isAttr) {
            if (isAttr.type !== IRAttributeType.String) {
                return warnAt(ParserDiagnostics.IS_ATTRIBUTE_CANNOT_BE_EXPRESSION, [], isAttr.location);
            }

            // Don't remove the is, because passed as attribute
            component = isAttr.value;
        }

        if (component) {
            element.component = component;

            if (!state.dependencies.includes(component)) {
                state.dependencies.push(component);
            }
        }
    }

    function applySlot(element: IRElement) {
        const { tag } = element;

        const slotAttribute = getTemplateAttribute(element, 'slot');
        if (slotAttribute) {
            if (slotAttribute.type === IRAttributeType.Expression) {
                return warnAt(ParserDiagnostics.SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION, [], slotAttribute.location);
            }
        }

        // Early exit if the element is not a slot
        if (tag !== 'slot') {
            return;
        }

        if (element.forEach || element.forOf || element.if) {
            return warnOnElement(ParserDiagnostics.SLOT_TAG_CANNOT_HAVE_DIRECTIVES, element.__original);
        }

        // Default slot have empty string name
        let name = '';

        const nameAttribute = getTemplateAttribute(element, 'name');
        if (nameAttribute) {
            if (nameAttribute.type === IRAttributeType.Expression) {
                return warnAt(ParserDiagnostics.NAME_ON_SLOT_CANNOT_BE_EXPRESSION, [], nameAttribute.location);
            } else if (nameAttribute.type === IRAttributeType.String) {
                name = nameAttribute.value;
            }
        }

        element.slotName = name;

        if (!state.slots.includes(name)) {
            state.slots.push(name);
        }
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
            if (!isCustomElement(element) && !isValidHTMLAttribute(element.tag, name)) {
                warnAt(ParserDiagnostics.INVALID_HTML_ATTRIBUTE, [name, tag], location);
            }

            if (attr.type === IRAttributeType.String) {
                if (name === 'id') {
                    if (/\s+/.test(attr.value)) {
                        warnAt(ParserDiagnostics.INVALID_ID_ATTRIBUTE, [attr.value], location);
                    }
                    if (isInIteration(element)) {
                        warnAt(ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION, [attr.value], location);
                    }
                    state.idAttrData.push({
                        key: element.key!,
                        location,
                        value: attr.value,
                    });
                }
            }

            if (isAttribute(element, name)) {
                const attrs = element.attrs || (element.attrs = {});
                attrs[name] = attr;
            } else {
                const props = element.props || (element.props = {});
                props[attributeToPropertyName(element, name)] = attr;

                removeAttribute(element, name);
            }
        });
    }

    function validateElement(element: IRElement) {
        const { tag } = element;
        const node = element.__original as parse5.AST.Default.Element;
        const isRoot = !element.parent;

        if (isRoot) {
            if (tag !== 'template') {
                return warnOnElement(ParserDiagnostics.ROOT_TAG_SHOULD_BE_TEMPLATE, node, [tag]);
            }

            const hasAttributes = node.attrs.length !== 0;
            if (hasAttributes) {
                return warnOnElement(ParserDiagnostics.ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES, node);
            }
        }

        if (tag === 'template') {
            // We check if the template element has some modifier applied to it. Directly checking if one of the
            // IRElement property is impossible. For example when an error occurs during the parsing of the if
            // expression, the `element.if` property remains undefined. It would results in 2 warnings instead of 1:
            //      - Invalid if expression
            //      - Unexpected template element
            //
            // Checking if the original HTMLElement has some attributes applied is a good enough for now.
            const hasAttributes = node.attrs.length !== 0;
            if (!isRoot && !hasAttributes) {
                warnOnElement(
                    ParserDiagnostics.NO_DIRECTIVE_FOUND_ON_TEMPLATE,
                    node,
                );
            }
        } else {
            const namespace = node.namespaceURI;
            const isNotAllowedHtmlTag = HTML_TAG_BLACKLIST.has(tag);
            if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
                return warnOnElement(
                    ParserDiagnostics.FORBIDDEN_TAG_ON_TEMPLATE,
                    node,
                    [tag]
                );
            }
            const isNotAllowedSvgTag = !SVG_TAG_WHITELIST.has(tag);
            if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
                return warnOnElement(
                    ParserDiagnostics.FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE,
                    node,
                    [tag]
                );
            }
        }
    }

    function validateAttributes(element: IRElement) {
        const { attrsList } = element;
        attrsList.forEach(attr => {
            const attrName = attr.name;
            if (isTabIndexAttribute(attrName)) {
                if (!isExpression(attr.value) && !isValidTabIndexAttributeValue(attr.value)) {
                    warnOnElement(
                        ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE,
                        element.__original
                    );
                }
            }
        });
    }

    function validateProperties(element: IRElement) {
        const { props } = element;
        if (props !== undefined) {
            for (const propName in props) {
                const { name: attrName, type, value } = props[propName];
                if (isTabIndexAttribute(attrName)) {
                    if (
                        type !== IRAttributeType.Expression &&
                        !isValidTabIndexAttributeValue(value)
                    ) {
                        warnOnElement(
                            ParserDiagnostics.INVALID_TABINDEX_ATTRIBUTE,
                            element.__original,
                        );
                    }
                }
            }
        }
    }

    function validateState(parseState: State) {
        const seenIds = new Set();
        for (const { location, value } of parseState.idAttrData) {
            if (seenIds.has(value)) {
                warnAt(
                    ParserDiagnostics.DUPLICATE_ID_FOUND,
                    [value],
                    location
                );
            } else {
                seenIds.add(value);
            }
        }
    }

    function collectMetadata(element: IRElement) {
        if (isCustomElement(element)) {
            state.extendedDependencies.push(getModuleMetadata(element));
        }
    }

    function parseTemplateExpression(node: IRNode, sourceExpression: string) {
        const expression = parseExpression(sourceExpression, node, state);
        const { bounded } = bindExpression(expression, node, false);

        for (const boundedIdentifier of bounded) {
            if (!state.ids.includes(boundedIdentifier)) {
                state.ids.push(boundedIdentifier);
            }
        }

        return expression;
    }

    function getTemplateAttribute(el: IRElement, pattern: string | RegExp): IRAttribute | undefined {
        const node = el.__original as parse5.AST.Default.Element;
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

        // parse5 do automatically the convertion from camelcase to all lowercase. If the attributes names
        // is not the same before and after the parsing, then the attribute name contains capital letters
        if (!rawAttribute.startsWith(name)) {
            warnAt(ParserDiagnostics.INVALID_ATTRIBUTE_CASE, [rawAttribute, treeAdapter.getTagName(node)], location);
            return;
        }

        try {
            let parsed: IRAttribute;

            const isBooleanAttribute = !rawAttribute.includes('=');
            const { value, escapedExpression } = normalizeAttributeValue(matching, rawAttribute, el.tag);
            if (isExpression(value) && !escapedExpression) {
                return parsed = {
                    name,
                    location,
                    type: IRAttributeType.Expression,
                    value: parseTemplateExpression(el, value),
                };
            } else if (isBooleanAttribute) {
                return parsed = {
                    name,
                    location,
                    type: IRAttributeType.Boolean,
                    value: true,
                };
            } else {
                return parsed = {
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
                    location: normalizeLocation(location)
                })
            );

            return;
        }
    }

    function warnOnElement(errorInfo: LWCErrorInfo, node: parse5.AST.Node, messageArgs?: any[]) {
        const getLocation = (toLocate?: parse5.AST.Node): { line: number, column: number } => {
            if (!toLocate) {
                return { line: 0, column: 0 };
            }

            const location = (toLocate as parse5.AST.Default.Element).__location;

            if (!location) {
                return getLocation(treeAdapter.getParentNode(toLocate));
            } else {
                return {
                    line: location.line || location.startLine,
                    column: location.col || location.startCol,
                };
            }
        };

        addDiagnostic(generateCompilerDiagnostic(errorInfo, {
            messageArgs,
            origin: {
                location: getLocation(node)
            }
        }));
    }

    function warnAt(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: parse5.MarkupData.Location) {
        addDiagnostic(generateCompilerDiagnostic(errorInfo, {
            messageArgs,
            origin: {
                location: normalizeLocation(location)
            }
        }));
    }

    // TODO: Update parse5-with-error to match version used for jsdom (interface for ElementLocation changed)
    function normalizeLocation(location?: parse5.MarkupData.Location): { line: number, column: number } {
        let line = 0;
        let column = 0;

        if (location) {
            line = location.line || location.startLine;
            column = location.col || location.startCol;
        }
        return { line, column };
    }

    function addDiagnostic(diagnostic: CompilerDiagnostic) {
        warnings.push(diagnostic);
    }

    return { root, warnings };
}
