import * as parse5 from 'parse5';

import {
    treeAdapter,
    parseHTML,
    traverseHTML,
    getSource,
    cleanTextNode,
    decodeTextContent,
} from './html';

import {
    isProp,
    getAttribute,
    removeAttribute,
    attributeName,
    normalizeAttributeValue,
    isValidHTMLAttribute,
    attributeToPropertyName,
    isBlacklistedAttribute,
} from './attribute';

import {
    isExpression,
    parseExpression,
    parseIdentifier,
    getRootIdentifier,
} from './expression';

import {
    toClassMap,
    toStyleMap,
} from './style';

import {
    createElement,
    isElement,
    isCustomElement,
    createText,
    isComponentProp,
} from '../shared/ir';

import {
    IRNode,
    IRElement,
    IRAttribute,
    CompilationWarning,
    WarningLevel,
    CompilationMetdata,
} from '../shared/types';

import {
    EXPRESSION_RE,
    IF_RE,
    IF_SEPERATOR,
    VALID_IF_MODIFIER,
    EVENT_HANDLER_RE,
    DEFAULT_SLOT_NAME,
} from './constants';

export default function parse(source: string): {
    root?: IRElement | undefined,
    warnings: CompilationWarning[],
    metadata: CompilationMetdata,
} {
    const warnings: CompilationWarning[] = [];
    const metadata: CompilationMetdata = {
        usedIds: new Set(),
        definedSlots: new Set(),
        componentDependency: new Set(),
    };

    const fragment = parseHTML(source);
    const templateRoot = getTemplateRoot(fragment);

    if (!templateRoot) {
        return { warnings, metadata };
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

                if (!root) {
                    validateRoot(element);
                    root = element;
                } else {
                    element.parent = parent;
                    parent.children.push(element);
                }

                applyFor(element);
                applyIf(element);
                applyStyle(element);
                applyHandlers(element);
                applyComponent(element);
                applySlot(element);

                parent = element;
                stack.push(element);
            },
            exit() {
                const element = stack.pop() as IRElement;

                if (element && isCustomElement(element)) {
                    dispathCustomElementChildrenInSlots(element);
                }

                applyAttributes(element);

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
            treeAdapter.isElementNode(child) && treeAdapter.getTagName(child) === 'template'
        ));

        if (!templateTag) {
            warnAt(`Missing root template tag`);
        } else {
            return templateTag as parse5.AST.Default.Element;
        }
    }

    function validateRoot(element: IRElement) {
        if (element.tag !== 'template') {
            return warnOnElement(`Expected root tag to be template, found ${element.tag}`, element);
        }

        if (element.attrsList.length) {
            return warnOnElement(`Root template doesn't allow attributes`, element.__original);
        }
    }

    function applyStyle(element: IRElement) {
        const classAttribute = getTemplateAttribute(element, 'class');
        if (classAttribute) {
            removeAttribute(element, 'class');

            if (classAttribute.type === 'string') {
                element.classMap = toClassMap(classAttribute.value);
            } else {
                element.className = classAttribute.value;
            }
        }

        const styleAttribute = getTemplateAttribute(element, 'style');
        if (styleAttribute) {
            removeAttribute(element, 'style');

            if (styleAttribute.type === 'expression') {
                return warnAt(`Dynamic style attribute is not (yet) supported`, styleAttribute.location);
            }

            element.style = toStyleMap(styleAttribute.value);
        }
    }

    function applyHandlers(element: IRElement) {
        let eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        while (eventHandlerAttribute) {
            removeAttribute(element, eventHandlerAttribute.name);

            if (eventHandlerAttribute.type === 'string') {
                return warnAt(`Event handler should be an expression`, eventHandlerAttribute.location);
            }

            // Strip the `on` prefix from the event handler name
            const eventName = eventHandlerAttribute.name.slice(2);
            const on = element.on || (element.on = {});
            on[eventName] = eventHandlerAttribute.value;

            eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        }
    }

    function applyIf(element: IRElement) {
        const ifAttribute = getTemplateAttribute(element, IF_RE);
        if (ifAttribute) {
            removeAttribute(element, IF_RE);

            if (ifAttribute.type !== 'expression') {
                return warnAt(`If directive should be an expression`, ifAttribute.location);
            }

            const [, modifier] = ifAttribute.name.split(IF_SEPERATOR);
            if (!VALID_IF_MODIFIER.has(modifier)) {
                return warnAt(`Unexpected if modifier ${modifier}`, ifAttribute.location);
            }

            element.if = ifAttribute.value;
            element.ifModifier = modifier;
        }
    }

    function applyFor(element: IRElement) {
        const forEachAttribute = getTemplateAttribute(element, 'for:each');
        if (forEachAttribute) {
            removeAttribute(element, 'for:each');

            if (forEachAttribute.type !== 'string') {
                return warnAt(`For:each attribute value should be an expression`, forEachAttribute.location);
            }

            const rawFor = forEachAttribute.value;
            const expressionMatch = rawFor.match(/(.*?)\s+(?:in|of)\s+(.*)/);
            if (!expressionMatch) {
                return warnAt(`Invalid for syntax "${rawFor}"`, forEachAttribute.location);
            }

            let alias = expressionMatch[1];
            let iterator;

            const iteratorMatch = alias.match(/\(([^,]*),([^,]*)(?:,([^,]*))?\)/);
            if (iteratorMatch) {
                alias = iteratorMatch[1].trim();
                iterator = iteratorMatch[2].trim();
            }

            try {
                // FIXME: this is a bad way to do expression tranformation
                element.for = parseTemplateExpression(element, `{${expressionMatch[2]}}`);
                element.forItem = parseIdentifier(alias);
                element.forIterator = parseIdentifier(iterator || 'index');
            } catch (err) {
                return warnAt(err.message, forEachAttribute.location);
            }
        }

        const keyAttribute = getTemplateAttribute(element, 'key');
        if (keyAttribute) {
            removeAttribute(element, 'key');

            if (keyAttribute.type !== 'expression') {
                return warnAt(`Key attribute value should be an expression`, keyAttribute.location);
            }

            element.forKey = keyAttribute.value;
        }
    }

    function applyComponent(element: IRElement) {
        const { tag } = element;
        let component: string | undefined;

        if (tag.includes('-')) {
            component = tag;
        }

        const isAttribute = getTemplateAttribute(element, 'is');
        if (isAttribute) {
            if (isAttribute.type !== 'string') {
                return warnAt(`Is attribute value can't be an expression`, isAttribute.location);
            }

            // Don't remove the is, because passed as attribute
            component = isAttribute.value;
        }

        if (component) {
            element.component = component;
            metadata.componentDependency.add(component);
        }
    }

    function applySlot(element: IRElement) {
        const { tag } = element;

        // Early exit if the element is not a slot
        if (tag !== 'slot') {
            return;
        }

        if (element.for || element.if) {
            return warnOnElement(`Slot tag can't be associated with directives`, element.__original);
        }

        // Default slot have empty string name
        let name = DEFAULT_SLOT_NAME;

        const nameAttribute = getTemplateAttribute(element, 'name');
        if (nameAttribute) {
            removeAttribute(element, 'name');

            if (nameAttribute.type !== 'string') {
                return warnAt(`Name attribute value can't be an expression.`, nameAttribute.location);
            }
            name = nameAttribute.value;
        }

        element.slotName = name;
        metadata.definedSlots.add(name);
    }

    function dispathCustomElementChildrenInSlots(element: IRElement) {
        const { children } = element;

        // Early exit if the custom component has no children in the template
        if (!children.length) {
            return;
        }

        const slotSet = {};

        for (const child of children) {
            let slotName = DEFAULT_SLOT_NAME;

            if (isElement(child)) {
                const slotAttribute = getTemplateAttribute(child, 'slot');
                if (slotAttribute) {
                    if (slotAttribute.type !== 'string') {
                        return warnAt(`Slot attribute value can't be an expression.`, slotAttribute.location);
                    }

                    removeAttribute(child, 'slot');

                    // Use default node name, if the slot attribute is set without value
                    if (slotAttribute.value.length) {
                        slotName = slotAttribute.value;
                    }
                }
            }

            const slot = slotSet[slotName] || ( slotSet[slotName] = [] );
            slot.push(child);
        }

        element.slotSet = slotSet;
        element.children = [];
    }

    function applyAttributes(element: IRElement) {
        const { tag, attrsList } = element;

        attrsList.forEach((rawAttr) => {
            const attr = getTemplateAttribute(element, attributeName(rawAttr));
            if (!attr) {
                return;
            }

            const { name, value, location } = attr;
            if (isProp(element, name)) {
                const props = element.props || (element.props = {});
                props[attributeToPropertyName(element, name)] = value;

                removeAttribute(element, name);
            } else if (!isValidHTMLAttribute(tag, name)) {
                const msg = [
                    `${name} is not valid attribute for ${tag}.`,
                    `For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tag}`,
                ].join(' ');

                warnAt(msg, location);
            } else if (isBlacklistedAttribute(name)) {
                return;
            } else {
                const attrs = element.attrs || (element.attrs = {});
                attrs[name] = value;
            }
        });
    }

    function parseTemplateExpression(node: IRNode, sourceExpression: string) {
        const expression = parseExpression(sourceExpression);
        const identifier = getRootIdentifier(expression);

        if (isComponentProp(identifier, node)) {
            metadata.usedIds.add(identifier.name);
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
        const location = nodeLocation.attrs[name];
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

            const value = normalizeAttributeValue(matching, rawAttribute);
            if (isExpression(value)) {
                return parsed = {
                    name,
                    location,
                    type: 'expression',
                    value: parseTemplateExpression(el, value),
                };
            } else {
                return parsed = {
                    name,
                    location,
                    type: 'string',
                    value,
                };
            }
        } catch (error) {
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

    return { root, warnings, metadata };
}
