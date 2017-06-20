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
} from '../shared/ir';

import {
    IRNode,
    IRElement,
    IRAttribute,
    IRAttributeType,
    IRStringAttribute,
    TemplateIdentifier,
    CompilationWarning,
    WarningLevel,
    CompilationMetadata,
} from '../shared/types';

import {
    bindExpression,
} from '../shared/scope';

import {
    EXPRESSION_RE,
    IF_RE,
    VALID_IF_MODIFIER,
    EVENT_HANDLER_RE,
    DEFAULT_SLOT_NAME,
} from './constants';

export default function parse(source: string): {
    root?: IRElement | undefined,
    warnings: CompilationWarning[],
    metadata: CompilationMetadata,
} {
    const warnings: CompilationWarning[] = [];
    const metadata: CompilationMetadata = {
        templateUsedIds: [],
        definedSlots: [],
        templateDependencies: [],
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

                applyForEach(element);
                applyIterator(element);
                applyKey(element);
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

            if (classAttribute.type === IRAttributeType.String) {
                element.classMap = toClassMap(classAttribute.value);
            } else if (classAttribute.type === IRAttributeType.Expression) {
                element.className = classAttribute.value;
            }
        }

        const styleAttribute = getTemplateAttribute(element, 'style');
        if (styleAttribute) {
            removeAttribute(element, 'style');

            if (styleAttribute.type !== IRAttributeType.String) {
                return warnAt(`Dynamic style attribute is not (yet) supported`, styleAttribute.location);
            }

            element.style = toStyleMap(styleAttribute.value);
        }
    }

    function applyHandlers(element: IRElement) {
        let eventHandlerAttribute = getTemplateAttribute(element, EVENT_HANDLER_RE);
        while (eventHandlerAttribute) {
            removeAttribute(element, eventHandlerAttribute.name);

            if (eventHandlerAttribute.type !== IRAttributeType.Expression) {
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

    function handleForEachDeprecatedSynax(forEachAttribute: IRStringAttribute) {
        const { value, location } = forEachAttribute;

        const expressionMatch = value.match(/(.*?)\s+(?:in|of)\s+(.*)/);
        if (!expressionMatch) {
            const genericDeprecationError = [
                `For:each directive has been deprecated.`,
                `Use instead for:each={[Array]} for:item="[itemIdentifier]"`,
            ].join(' ');
            return warnAt(genericDeprecationError, location);
        }

        let alias = expressionMatch[1];
        const iteratorMatch = alias.match(/\(([^,]*),([^,]*)(?:,([^,]*))?\)/);
        if (iteratorMatch) {
            alias = iteratorMatch[1].trim();
        }

        // Create contextual error on how to transition with the new syntax
        const validAlias = alias.toLocaleLowerCase();
        const errorMessage = [
            `For:each directive has been deprecated.`,
            `Use instead for:each={${expressionMatch[2]}} for:item="${validAlias}"`,
        ].join(' ');
        return warnAt(errorMessage, location);
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
                return forEachAttribute.type === IRAttributeType.String ?
                    handleForEachDeprecatedSynax(forEachAttribute) :
                    warnAt('for:each directive is expected to be a expression.', forEachAttribute.location);
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
                    return warnAt('for:index directive is expected to be a string.', forIndex.location);
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
        const forOfAttribute = getTemplateAttribute(element, 'for:of');
        const forIterator = getTemplateAttribute(element, 'for:iterator');

        if (!forOfAttribute && !forIterator) {
            return;
        } else if (forOfAttribute && forIterator) {
            removeAttribute(element, forOfAttribute.name);
            removeAttribute(element, forIterator.name);

            if (forOfAttribute.type !== IRAttributeType.Expression) {
                return warnAt('for:of directive is expected to be an expression.', forOfAttribute.location);
            } else if (forIterator.type !== IRAttributeType.String) {
                return warnAt('for:iterator directive is expected to be a string.', forIterator.location);
            }

            let iterator: TemplateIdentifier;
            try {
                iterator = parseIdentifier(forIterator.value);
            } catch (error) {
                return warnAt(`${forIterator.value} is not a valid identifier`, forIterator.location);
            }

            element.forOf = {
                expression: forOfAttribute.value,
                iterator,
            };
        } else {
            return warnOnElement(
                `for:of and for:iterator directives should be associated together.`,
                element.__original,
            );
        }
    }

    function applyKey(element: IRElement) {
        const keyAttribute = getTemplateAttribute(element, 'key');
        if (keyAttribute) {
            removeAttribute(element, 'key');

            if (keyAttribute.type !== IRAttributeType.Expression) {
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

            const node = element.__original as parse5.AST.Default.Element;
            const location = node.__location!;

            // Self closing tags don't have end tag locations
            // TODO: Remove this once parse5 supports errors from HTML spec
            if (!location.endTag) {
                const errorMessage = [
                    `Self-closing syntax <${tag}/> is not allowed in custom elements,`,
                    `use an explicit closing tag instead <${tag}></${tag}>.`,
                ].join(' ');
                return warnAt(errorMessage, location.startTag);
            }
        }

        const isAttribute = getTemplateAttribute(element, 'is');
        if (isAttribute) {
            if (isAttribute.type !== IRAttributeType.String) {
                return warnAt(`Is attribute value can't be an expression`, isAttribute.location);
            }

            // Don't remove the is, because passed as attribute
            component = isAttribute.value;
        }

        if (component) {
            element.component = component;
            const dependencies = metadata.templateDependencies;
            if (!dependencies.includes(component)) {
                dependencies.push(component);
            }
        }
    }

    function applySlot(element: IRElement) {
        const { tag } = element;

        // Early exit if the element is not a slot
        if (tag !== 'slot') {
            return;
        }

        if (element.forEach || element.forOf || element.if) {
            return warnOnElement(`Slot tag can't be associated with directives`, element.__original);
        }

        // Default slot have empty string name
        let name = DEFAULT_SLOT_NAME;

        const nameAttribute = getTemplateAttribute(element, 'name');
        if (nameAttribute) {
            removeAttribute(element, 'name');

            if (nameAttribute.type === IRAttributeType.Expression) {
                return warnAt(`Name attribute value can't be an expression.`, nameAttribute.location);
            } else if (nameAttribute.type === IRAttributeType.String) {
                name = nameAttribute.value;
            }
        }

        element.slotName = name;

        if (!metadata.definedSlots.includes(name)) {
            metadata.definedSlots.push(name);
        }
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
                    if (slotAttribute.type === IRAttributeType.Expression) {
                        return warnAt(`Slot attribute value can't be an expression.`, slotAttribute.location);
                    }

                    removeAttribute(child, 'slot');

                    // Use default node name, if the slot attribute is set without value
                    if (slotAttribute.type === IRAttributeType.String && slotAttribute.value.length) {
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

            const { name, location } = attr;
            if (isProp(element, name)) {
                const props = element.props || (element.props = {});
                props[attributeToPropertyName(element, name)] = attr;

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
                attrs[name] = attr;
            }
        });
    }

    function parseTemplateExpression(node: IRNode, sourceExpression: string) {
        const expression = parseExpression(sourceExpression);
        const { bounded } = bindExpression(expression, node, false);

        for (const boundedIdentifier of bounded) {
            if (!metadata.templateUsedIds.includes(boundedIdentifier)) {
                metadata.templateUsedIds.push(boundedIdentifier);
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
            const value = normalizeAttributeValue(matching, rawAttribute);
            if (isExpression(value)) {
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

    return { root, warnings, metadata };
}
