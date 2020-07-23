import * as parse5 from 'parse5';
import {
    ASTExpression,
    ASTText,
    ASTComment,
    ASTAttribute,
    ASTRoot,
    ASTIdentifier,
    CompilerConfig,
    ASTComponent,
    ASTEventListener,
    ASTParentNode,
    ASTIfBlock,
    ASTForBlock,
    ASTChildNode,
    ASTElement,
    ASTProperty,
} from '../types';

import * as parse5Utils from '../utils/parse5';
import { HTML_NAMESPACE } from '../utils/namespaces';

import { parseExpression, parseExpressionAt, parseIdentifer } from './expression';

function parseTextNode(
    textNode: parse5.TextNode,
    parent: ASTParentNode,
    config: CompilerConfig
): ASTText[] {
    const { value: str } = textNode;
    const astNodes: ASTText[] = [];

    let position = 0;
    while (position < str.length) {
        if (!config.preserveWhitespaces) {
            while (position < str.length && str.charAt(position).match(/[\n\t\s]/)) {
                position++;
            }
        }

        const textStart = position;
        while (position < str.length && str.charAt(position) !== '{') {
            position++;
        }

        if (textStart !== position) {
            astNodes.push({
                type: 'text',
                value: str.slice(textStart, position),
                parent,
            });
        }

        if (str.charAt(position) === '{') {
            const { expression, offset } = parseExpressionAt(str, position);

            position = offset;
            astNodes.push({
                type: 'text',
                value: expression,
                parent,
            });
        }
    }

    return astNodes;
}

function parseComment(commentNode: parse5.CommentNode, parent: ASTParentNode): ASTComment {
    return {
        type: 'comment',
        value: commentNode.data,
        parent,
    };
}

function consumeIfAttribute({
    attrs,
}: parse5.Element): { modifier: 'true' | 'false'; condition: ASTExpression } | null {
    const ifAttribute = attrs.find((attr) => attr.name.startsWith('if:'));
    if (!ifAttribute) {
        return null;
    }

    attrs.splice(attrs.indexOf(ifAttribute), 1);

    const modifierMatch = ifAttribute.name.match(/^if:(.*)$/);
    if (!modifierMatch) {
        throw new Error('Invalid if directive');
    }

    const modifier = modifierMatch[1];
    if (modifier !== 'true' && modifier !== 'false') {
        throw new Error(`Invalid if modifier ${modifier}`);
    }

    return {
        modifier,
        condition: parseExpression(ifAttribute.value),
    };
}

function consumeForAttribute({
    attrs,
}: parse5.Element): {
    expression: ASTExpression;
    item?: ASTIdentifier;
    index?: ASTIdentifier;
} | null {
    const forEachAttribute = attrs.find((attr) => attr.name === 'for:each');
    if (!forEachAttribute) {
        return null;
    }

    attrs.splice(attrs.indexOf(forEachAttribute), 1);

    const forItemAttribute = attrs.find((attr) => attr.name === 'for:item');
    if (forItemAttribute) {
        attrs.splice(attrs.indexOf(forItemAttribute), 1);
    }

    const forIndexAttribute = attrs.find((attr) => attr.name === 'for:index');
    if (forIndexAttribute) {
        attrs.splice(attrs.indexOf(forIndexAttribute), 1);
    }

    return {
        expression: parseExpression(forEachAttribute.value),
        item: forItemAttribute ? parseIdentifer(forItemAttribute.value) : undefined,
        index: forIndexAttribute ? parseIdentifer(forIndexAttribute.value) : undefined,
    };
}

function consumeEventListeners({ attrs }: parse5.Element): ASTEventListener[] {
    const listeners: ASTEventListener[] = [];

    for (const attribute of attrs) {
        const listenerMatch = attribute.name.match(/^on(.+)$/);
        if (!listenerMatch) {
            continue;
        }

        const [, name] = listenerMatch;
        const handler = parseExpression(attribute.value);

        attrs.splice(attrs.indexOf(attribute), 1);
        listeners.push({
            type: 'listener',
            name,
            handler,
        });
    }

    return listeners;
}

function consumeComponentProperties({ attrs }: parse5.Element): ASTProperty[] {
    const properties: ASTProperty[] = [];

    for (const attribute of attrs) {
        const value = attribute.value.startsWith('{')
            ? parseExpression(attribute.value)
            : attribute.value;

        attrs.splice(attrs.indexOf(attribute), 1);

        properties.push({
            type: 'property',
            name: attribute.name,
            value,
        })
    }

    return properties;
}

function parseAttributes(attribute: parse5.Attribute): ASTAttribute {
    const value = attribute.value.startsWith('{')
        ? parseExpression(attribute.value)
        : attribute.value;

    return {
        type: 'attribute',
        name: attribute.name,
        value,
    };
}

function parseComponent(
    node: parse5.Element,
    parent: ASTParentNode,
    config: CompilerConfig
): ASTComponent {
    const listeners = consumeEventListeners(node);
    const properties = consumeComponentProperties(node);
    const attributes = node.attrs.map(parseAttributes);

    const component: ASTComponent = {
        type: 'component',
        name: node.tagName,
        children: [],
        attributes,
        properties,
        listeners,
        parent,
    };

    component.children = node.childNodes.flatMap((child) =>
        parseChildNode(child, component, config)
    );

    return component;
}

function parseElement(
    node: parse5.Element,
    parent: ASTParentNode,
    config: CompilerConfig
): ASTChildNode[] {
    const forAttribute = consumeForAttribute(node);
    const ifAttribute = consumeIfAttribute(node);

    let elements: ASTChildNode[] = [];

    if (node.tagName.includes('-')) {
        elements = [parseComponent(node, parent, config)];
    } else if (parse5Utils.isTemplate(node)) {
        elements = node.content.childNodes.flatMap((child) =>
            parseChildNode(child, parent, config)
        );
    } else {
        const listeners = consumeEventListeners(node);
        const attributes = node.attrs.map(parseAttributes);
        const children = node.childNodes.flatMap((child) => parseChildNode(child, parent, config));

        const element: ASTElement = {
            type: 'element',
            name: node.tagName,
            namespace: HTML_NAMESPACE !== node.namespaceURI ? node.namespaceURI : undefined,
            attributes,
            listeners,
            children,
            parent,
        };

        elements = [element];
    }

    if (ifAttribute) {
        const ifBlock: ASTIfBlock = {
            type: 'if-block',
            modifier: ifAttribute.modifier,
            condition: ifAttribute.condition,
            children: [],
            parent,
        };
        ifBlock.children = elements.map((child) => ({ ...child, parent: ifBlock }));

        elements = [ifBlock];
    }

    if (forAttribute) {
        const forBLock: ASTForBlock = {
            type: 'for-block',
            expression: forAttribute.expression,
            item: forAttribute.item,
            index: forAttribute.index,
            children: [],
            parent,
        };
        forBLock.children = elements.map((child) => ({ ...child, parent: forBLock }));

        elements = [forBLock];
    }

    return elements;
}

function parseChildNode(
    node: parse5.Node,
    parent: ASTParentNode,
    config: CompilerConfig
): ASTChildNode[] {
    if (parse5Utils.isTextNode(node)) {
        return parseTextNode(node, parent, config);
    } else if (parse5Utils.isCommentNode(node)) {
        return [parseComment(node, parent)];
    } else if (parse5Utils.isElement(node)) {
        return parseElement(node, parent, config);
    }

    throw new Error(`Unexpected node "${node}"`);
}

export function parseTemplate(src: string, config: CompilerConfig): ASTRoot {
    const fragment = parse5.parseFragment(src);

    const rootElements = fragment.childNodes.filter(parse5Utils.isElement);
    if (rootElements.length === 0) {
        throw new Error('No <template> tag found.');
    } else if (rootElements.length > 1) {
        throw new Error('Multiple root elements found in the template');
    }

    const [rootTemplate] = rootElements;
    if (!parse5Utils.isTemplate(rootTemplate)) {
        throw new Error('Unexpected element at the root');
    }

    const root: ASTRoot = {
        type: 'root',
        children: [],
    };

    root.children = rootTemplate.content.childNodes.flatMap((child) =>
        parseChildNode(child, root, config)
    );

    return root;
}
