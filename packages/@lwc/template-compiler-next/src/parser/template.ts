import * as parse5 from 'parse5';
import {
    ASTExpression,
    ASTText,
    ASTComment,
    ASTAttribute,
    ASTRoot,
    ASTChildNode,
    ASTIdentifier,
    CompilerConfig,
    ASTComponent,
    ASTEventListener,
} from '../types';

import * as parse5Utils from '../utils/parse5';
import { HTML_NAMESPACE } from '../utils/namespaces';

import { parseExpression, parseExpressionAt, parseIdentifer } from './expression';

function parseTextNode(textNode: parse5.TextNode, config: CompilerConfig): ASTText[] {
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
            });
        }

        if (str.charAt(position) === '{') {
            const { expression, offset } = parseExpressionAt(str, position);

            position = offset;
            astNodes.push({
                type: 'text',
                value: expression,
            });
        }
    }

    return astNodes;
}

function parseComment(commentNode: parse5.CommentNode): ASTComment {
    return {
        type: 'comment',
        value: commentNode.data,
    };
}

function consumeIfAttribute({
    attrs,
}: parse5.Element): { modifier: 'true' | 'false'; condition: ASTExpression } | null {
    const ifAttribute = attrs.find(attr => attr.name.startsWith('if:'));
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
    const forEachAttribute = attrs.find(attr => attr.name === 'for:each');
    if (!forEachAttribute) {
        return null;
    }

    attrs.splice(attrs.indexOf(forEachAttribute), 1);

    const forItemAttribute = attrs.find(attr => attr.name === 'for:item');
    if (forItemAttribute) {
        attrs.splice(attrs.indexOf(forItemAttribute), 1);
    }

    const forIndexAttribute = attrs.find(attr => attr.name === 'for:index');
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

function parseComponent(node: parse5.Element, config: CompilerConfig): ASTComponent {
    const listeners = consumeEventListeners(node);

    const slottedContent: Record<string, ASTChildNode[]> = {};
    for (const child of node.childNodes) {
        let slotName = 'default';

        if (parse5Utils.isElement(child)) {
            slotName = child.attrs.find(attr => attr.name === 'slot')?.value || slotName;
        }

        let slotChildren = slottedContent[slotName];
        if (!slotChildren) {
            slotChildren = [];
            slottedContent[slotName] = slotChildren;
        }

        slotChildren.push(...parseChildNode(child, config));
    }

    return {
        type: 'component',
        name: node.tagName,
        listeners,
        slottedContent,
    };
}

function parseElement(node: parse5.Element, config: CompilerConfig): ASTChildNode[] {
    const forAttribute = consumeForAttribute(node);
    const ifAttribute = consumeIfAttribute(node);

    let elements: ASTChildNode[] = [];

    if (node.tagName.includes('-')) {
        elements = [parseComponent(node, config)];
    } else if (parse5Utils.isTemplate(node)) {
        elements = node.content.childNodes.flatMap(child => parseChildNode(child, config));
    } else {
        const listeners = consumeEventListeners(node);
        const attributes = node.attrs.map(parseAttributes);
        const children = node.childNodes.flatMap(child => parseChildNode(child, config));

        elements = [
            {
                type: 'element',
                name: node.tagName,
                namespace: HTML_NAMESPACE !== node.namespaceURI ? node.namespaceURI : undefined,
                attributes,
                listeners,
                children,
            },
        ];
    }

    if (ifAttribute) {
        elements = [
            {
                type: 'if-block',
                modifier: ifAttribute.modifier,
                condition: ifAttribute.condition,
                children: elements,
            },
        ];
    }

    if (forAttribute) {
        elements = [
            {
                type: 'for-block',
                expression: forAttribute.expression,
                item: forAttribute.item,
                index: forAttribute.index,
                children: elements,
            },
        ];
    }

    return elements;
}

function parseChildNode(node: parse5.Node, config: CompilerConfig): ASTChildNode[] {
    if (parse5Utils.isTextNode(node)) {
        return parseTextNode(node, config);
    } else if (parse5Utils.isCommentNode(node)) {
        return [parseComment(node)];
    } else if (parse5Utils.isElement(node)) {
        return parseElement(node, config);
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

    const children = rootTemplate.content.childNodes.flatMap(child =>
        parseChildNode(child, config)
    );

    return {
        type: 'root',
        children,
    };
}
