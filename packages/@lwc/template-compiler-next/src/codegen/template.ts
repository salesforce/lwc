import { code } from '../utils/code';
import {
    ASTRoot,
    ASTChildNode,
    ASTText,
    ASTElement,
    ASTExpression,
    ASTAttribute,
    ASTIfBlock,
    ASTComponent,
    ASTEventListener,
    ASTForBlock,
} from '../types';

import { Block } from './block';
import { Renderer } from './renderer';

import { componentNameToModuleSpecifier } from '../utils/module-names';

const DEFAULT_PARENT_IDENTIFIER = 'target';

function generateExpression(expression: ASTExpression): string {
    switch (expression.type) {
        case 'identifier':
            return expression.name;

        case 'member-expression':
            return `${generateExpression(expression.object)}.${generateExpression(
                expression.property
            )}`;
    }
}

function generateTextNode(
    block: Block,
    text: ASTText,
    parent: string = DEFAULT_PARENT_IDENTIFIER
): void {
    if (typeof text.value === 'string') {
        block.addElement('text', parent, `@createText(${JSON.stringify(text.value)})`);
    } else {
        const valueLookup = `context.${generateExpression(text.value)}`;

        const valueIdentifier = block.registerIdentifier(`text_value`, valueLookup);
        const nodeIdentifier = block.addElement('text', parent, `@createText(${valueIdentifier})`);

        block.updateStatements.push(code`
            if (${valueIdentifier} !== (${valueIdentifier} = ${valueLookup})) {
                @setText(${nodeIdentifier}, ${valueIdentifier});
            }
        `);
    }
}

function generateAttribute(block: Block, attribute: ASTAttribute, target: string): void {
    if (typeof attribute.value === 'string') {
        block.createStatements.push(
            `@setAttribute(${target}, "${attribute.name}", ${JSON.stringify(attribute.value)});`
        );
    } else {
        const valueLookup = `context.${generateExpression(attribute.value)}`;

        const valueIdentifier = block.registerIdentifier(`${attribute.name}_value`, valueLookup);

        block.createStatements.push(
            `@setAttribute(${target}, "${attribute.name}", ${valueIdentifier});`
        );
        block.updateStatements.push(code`
            if (${valueIdentifier} !== (${valueIdentifier} = ${valueLookup})) {
                @setAttribute(${target}, "${attribute.name}", ${valueIdentifier});
            }
        `);
    }
}

function generateListener(block: Block, listener: ASTEventListener, target: string): void {
    const handlerLookup = `context.${generateExpression(listener.handler)}`;
    block.createStatements.push(
        `@addEventListener(${target}, "${listener.name}", ${handlerLookup});`
    );
}

function generateElement(
    renderer: Renderer,
    block: Block,
    element: ASTElement,
    parent?: string
): void {
    // Check if the element has or not a parent in the block.
    const isBlockTopLevel = parent === undefined;
    parent = parent ?? DEFAULT_PARENT_IDENTIFIER;

    const identifier = block.registerIdentifier(element.name);

    block.createStatements.push(
        `${identifier} = ${
            !element.namespace
                ? `@createElement("${element.name}")`
                : `@createElement("${element.name}", "${element.namespace}")`
        };`
    );

    block.insertStatements.push(`@insert(${identifier}, ${parent});`);

    // Only disconnect elements that are at the block top level.
    if (isBlockTopLevel) {
        block.detachStatements.push(`@remove(${identifier}, ${parent});`);
    }

    for (const attribute of element.attributes) {
        generateAttribute(block, attribute, identifier);
    }

    for (const listener of element.listeners) {
        generateListener(block, listener, identifier);
    }

    for (const child of element.children) {
        generateChildNode(renderer, block, child, identifier);
    }
}

function generateComponent(
    renderer: Renderer,
    block: Block,
    component: ASTComponent,
    parent: string = DEFAULT_PARENT_IDENTIFIER
): void {
    const ctorIdentifier = renderer.addImport(
        componentNameToModuleSpecifier(component.name),
        'default'
    );

    const identifier = block.registerIdentifier(component.name);

    block.createStatements.push(
        `${identifier} = @createComponent("${component.name}", ${ctorIdentifier});`
    );
    block.insertStatements.push(`@connectComponent(${identifier}, ${parent});`);
    block.detachStatements.push(`@disconnectComponent(${identifier}, ${parent});`);

    for (const listener of component.listeners) {
        generateListener(block, listener, identifier);
    }
}

function generateIfBlock(
    renderer: Renderer,
    block: Block,
    ifBlockNode: ASTIfBlock,
    parent: string = DEFAULT_PARENT_IDENTIFIER
): void {
    const conditionLookup = `context.${generateExpression(ifBlockNode.condition)}`;
    const conditionExpression =
        ifBlockNode.modifier === 'false' ? `!${conditionLookup}` : conditionLookup;

    const ifBlock = renderer.createBlock('ifBlock');
    for (const child of ifBlockNode.children) {
        generateChildNode(renderer, ifBlock, child);
    }

    const ifBlockIdentifier = block.registerIdentifier(
        'if_block',
        `${conditionExpression} && ${ifBlock.name}(context)`
    );

    block.createStatements.push(code`
        if (${ifBlockIdentifier}) {
            ${ifBlockIdentifier}.create();
        }
    `);
    block.insertStatements.push(code`
        if (${ifBlockIdentifier}) {
            ${ifBlockIdentifier}.insert(${parent});
        }
    `);
    block.updateStatements.push(code`
        if (${conditionExpression}) {
            if (${ifBlockIdentifier}) {
                ${ifBlockIdentifier}.update();
            } else {
                ${ifBlockIdentifier} = ${ifBlock.name}(context);
                ${ifBlockIdentifier}.create();
                ${ifBlockIdentifier}.insert(${parent});
            }
        } else {
            ${ifBlockIdentifier}.detach();
            ${ifBlockIdentifier} = undefined;
        }
    `);
    block.detachStatements.push(code`
        if (${ifBlockIdentifier}) {
            ${ifBlockIdentifier}.detach();
        }
    `);
}

function generateForBlock(
    _renderer: Renderer,
    _block: Block,
    _forBlockNode: ASTForBlock,
    _parent?: string
): void {
    // XTODO
}

function generateChildNode(
    renderer: Renderer,
    block: Block,
    childNode: ASTChildNode,
    parent?: string
): void {
    switch (childNode.type) {
        case 'comment':
            // Do nothing
            break;

        case 'text':
            generateTextNode(block, childNode, parent);
            break;

        case 'element':
            generateElement(renderer, block, childNode, parent);
            break;

        case 'component':
            generateComponent(renderer, block, childNode, parent);
            break;

        case 'if-block':
            generateIfBlock(renderer, block, childNode, parent);
            break;

        case 'for-block':
            generateForBlock(renderer, block, childNode, parent);
            break;

        default:
            throw new Error(`Unexpected child node "${(childNode as any).type}"`);
    }
}

export function generateTemplate(root: ASTRoot): string {
    const renderer = new Renderer();
    const block = renderer.createBlock('template', { isRoot: true });

    for (const child of root.children) {
        generateChildNode(renderer, block, child);
    }

    return renderer.render();
}
