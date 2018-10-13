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
    isIdReferencingAttribute,
    isRestrictedStaticAttribute,
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
    CompilationWarning,
    WarningLevel,
    ForIterator,
    IRExpressionAttribute,
    ForEach,
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

function getKeyGenerator() {
    let count = 1;
    return () => count++;
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
    warnings: CompilationWarning[],
} {
    const warnings: CompilationWarning[] = [];
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

                applyForEach(element);
                applyIterator(element);
                applyIf(element);
                applyStyle(element);
                applyHandlers(element);
                applyComponent(element);
                applySlot(element);
                applyKey(element, elementNode.__location);

                parent = element;
                stack.push(element);
            },
            exit() {
                const element = stack.pop() as IRElement;
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
                            return warnAt(error.message, location);
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
            warnOnElement(`Multiple roots found`, documentFragment.childNodes[1]);
        }

        const templateTag = documentFragment.childNodes.find((child) => (
            treeAdapter.isElementNode(child)
        ));

        if (!templateTag) {
            warnAt(`Missing root template tag`);
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
                return warnAt(`Event handler should be an expression`, eventHandlerAttribute.location);
            }

            let eventName = eventHandlerAttribute.name;
            if (!eventName.match(EVENT_HANDLER_NAME_RE)) {
                const msg = [
                    `Invalid event name ${eventName}.`,
                    `Event name can only contain lower-case alphabetic characters`,
                ].join(' ');
                return warnAt(msg, eventHandlerAttribute.location);
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
                return warnAt(`If directive should be an expression`, ifAttribute.location);
            }

            const [, modifier] = ifAttribute.name.split(':');
            if (!VALID_IF_MODIFIER.has(modifier)) {
                return warnAt(`Unexpected if modifier ${modifier}`, ifAttribute.location);
            }

            element.if = ifAttribute.value;
            element.ifModifier = modifier;
        }
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
                return warnAt('for:each directive is expected to be a expression.', forEachAttribute.location);
            } else if (forItemAttribute.type !== IRAttributeType.String) {
                return warnAt('for:item directive is expected to be a string.', forItemAttribute.location);
            }

            let item: TemplateIdentifier;
            try {
                item = parseIdentifier(forItemAttribute.value);
            } catch (error) {
                return warnAt(`${forItemAttribute.value} is not a valid identifier`, forItemAttribute.location);
            }

            let index: TemplateIdentifier | undefined;
            if (forIndex) {
                removeAttribute(element, forIndex.name);
                if (forIndex.type !== IRAttributeType.String) {
                    return warnAt(`for:index directive is expected to be a string.`, forIndex.location);
                }

                try {
                    index = parseIdentifier(forIndex.value);
                } catch (error) {
                    return warnAt(`${forIndex.value} is not a valid identifier`, forIndex.location);
                }
            }

            element.forEach = {
                expression: forEachAttribute.value,
                item,
                index,
            };
        } else {
            return warnOnElement(
                `for:each and for:item directives should be associated together.`,
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
            const message = `${iteratorExpression.name} directive is expected to be an expression.`;
            return warnAt(message, iteratorExpression.location);
        }

        let iterator: TemplateIdentifier;
        try {
            iterator = parseIdentifier(iteratorName);
        } catch (error) {
            return warnAt(`${iteratorName} is not a valid identifier`, iteratorExpression.location);
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
                return warnAt(`Key attribute value should be an expression`, keyAttribute.location);
            }

            const forOfParent = getForOfParent(element);
            const forEachParent = getForEachParent(element);
            if (forOfParent) {
                if (attributeExpressionReferencesForOfIndex(keyAttribute, forOfParent.forOf!)) {
                    return warnAt(`Invalid key value for element <${element.tag}>. Key cannot reference iterator index`, keyAttribute.location);
                }
            } else if (forEachParent) {
                if (attributeExpressionReferencesForEachIndex(keyAttribute, forEachParent.forEach!)) {
                    const name = ('name' in keyAttribute.value) && keyAttribute.value.name;
                    return warnAt(`Invalid key value for element <${element.tag}>. Key cannot reference for:each index ${name}`, keyAttribute.location);
                }
            }
            removeAttribute(element, 'key');

            element.forKey = keyAttribute.value;
        } else if (isIteratorElement(element) && element.tag !== 'template') {
            return warnAt(`Missing key for element <${element.tag}> inside of iterator. Elements within iterators must have a unique, computed key value.`, location);
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
                return warnAt(`Is attribute value can't be an expression`, isAttr.location);
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
                return warnAt(`Slot attribute value can't be an expression.`, slotAttribute.location);
            }
        }

        // Early exit if the element is not a slot
        if (tag !== 'slot') {
            return;
        }

        if (element.forEach || element.forOf || element.if) {
            return warnOnElement(`Slot tag can't be associated with directives`, element.__original);
        }

        // Default slot have empty string name
        let name = '';

        const nameAttribute = getTemplateAttribute(element, 'name');
        if (nameAttribute) {
            if (nameAttribute.type === IRAttributeType.Expression) {
                return warnAt(`Name attribute on slot tag can't be an expression.`, nameAttribute.location);
            } else if (nameAttribute.type === IRAttributeType.String) {
                name = nameAttribute.value;
            }
        }

        element.slotName = name;

        if (!state.slots.includes(name)) {
            state.slots.push(name);
        }
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
                const msg = [
                    `${name} is not valid attribute for ${tag}. For more information refer to`,
                    `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tag}`,
                ].join(' ');

                warnAt(msg, location);
            }

            if (attr.type === IRAttributeType.String) {
                if (name === 'id') {
                    state.idAttrData.push({
                        key: element.key!,
                        location: attr.location,
                        value: attr.value,
                    });
                } else if (isIdReferencingAttribute(name)) {
                    state.idrefAttrData.push({
                        key: element.key!,
                        location: attr.location,
                        name: attr.name,
                        values: attr.value.split(/\s+/),
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
                return warnOnElement(`Expected root tag to be template, found ${tag}`, node);
            }

            const hasAttributes = node.attrs.length !== 0;
            if (hasAttributes) {
                return warnOnElement(`Root template doesn't allow attributes`, node);
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
                    'Invalid template tag. A directive is expected to be associated with the template tag.',
                    node,
                );
            }
        } else {
            const namespace = node.namespaceURI;
            const isNotAllowedHtmlTag = HTML_TAG_BLACKLIST.has(tag);
            if (namespace === HTML_NAMESPACE_URI && isNotAllowedHtmlTag) {
                return warnOnElement(
                    `Forbidden tag found in template: '<${tag}>' tag is not allowed.`,
                    node,
                );
            }
            const isNotAllowedSvgTag = !SVG_TAG_WHITELIST.has(tag);
            if (namespace === SVG_NAMESPACE_URI && isNotAllowedSvgTag) {
                return warnOnElement(
                    `Forbidden svg namespace tag found in template: '<${tag}>' tag is not allowed within <svg>`,
                    node
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
                        `The attribute "tabindex" can only be set to "0" or "-1".`,
                        element.__original,
                        'error',
                    );
                }
            }
            if (isRestrictedStaticAttribute(attr.name)) {
                if (isExpression(attr.value)) {
                    warnOnElement(
                        `The attribute "${attr.name}" cannot be an expression. It must be a static string value.`,
                        element.__original,
                        'warning',
                    );
                } else if (attr.value === '') {
                    warnOnElement(
                        `The attribute "${attr.name}" cannot be an empty string. Remove the attribute if it is unnecessary.`,
                        element.__original,
                        'warning',
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
                            `The attribute "tabindex" can only be set to "0" or "-1".`,
                            element.__original,
                            'error',
                        );
                    }
                }
                if (isRestrictedStaticAttribute(attrName)) {
                    if (type === IRAttributeType.Expression) {
                        warnOnElement(
                            `The attribute "${attrName}" cannot be an expression. It must be a static string value.`,
                            element.__original,
                            'warning',
                        );
                    }
                    if (value === '') {
                        warnOnElement(
                            `The attribute "${attrName}" cannot be an empty string. Remove the attribute if it is unnecessary.`,
                            element.__original,
                            'warning',
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
                    `Duplicate id value "${value}" detected. Id values must be unique within a template.`,
                    location,
                    'error',
                );
            } else {
                seenIds.add(value);
            }
        }
        const seenIdrefs = new Set();
        for (const { location, name, values } of parseState.idrefAttrData) {
            for (const value of values) {
                if (!seenIds.has(value)) {
                    warnAt(
                        `Attribute "${name}" references a non-existant id "${value}".`,
                        location,
                        'error',
                    );
                } else {
                    seenIdrefs.add(value);
                }
            }
        }
        for (const { location, value } of parseState.idAttrData) {
            if (!seenIdrefs.has(value)) {
                warnAt(
                    `Id "${value}" must be referenced in the template by an id-referencing attribute such as "for" or "aria-describedby".`,
                    location,
                    'warning',
                );
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
            const msg = [
                `${rawAttribute} is not valid attribute for ${treeAdapter.getTagName(node)}.`,
                `All attributes name should be all lowercase.`,
            ].join(' ');

            warnAt(msg, location);
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

            warnAt(error.message, location);
            return;
        }
    }

    function warnOnElement(message: string, node: parse5.AST.Node, level: WarningLevel = 'error') {
        const getLocation = (toLocate?: parse5.AST.Node): { start: number, length: number } => {
            if (!toLocate) {
                return { start: 0, length: 0 };
            }

            const location = (toLocate as parse5.AST.Default.Element).__location;

            if (!location) {
                return getLocation(treeAdapter.getParentNode(toLocate));
            } else {
                return {
                    start: location.startOffset,
                    length: location.endOffset - location.startOffset,
                };
            }
        };

        const { start, length } = getLocation(node);
        warnings.push({ message, start, length, level });
    }

    function warnAt(message: string, location?: parse5.MarkupData.Location, level: WarningLevel = 'error') {
        let start = 0;
        let length = 0;

        if (location) {
            const { startOffset, endOffset } = location;
            start = startOffset;
            length = endOffset - startOffset;
        }

        warnings.push({ message, start, length, level });
    }

    return { root, warnings };
}
