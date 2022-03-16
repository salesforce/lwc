/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, assert, isNull, isUndefined, keys } from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';
import {
    getAttribute,
    getClassList,
    getFirstChild,
    getProperty,
    nextSibling,
    setProperty,
    setText,
} from '../renderer';

import { cloneAndOmitKey, parseStyleText } from './utils';
import { allocateChildren, mount, removeNode } from './rendering';
import {
    createVM,
    LwcDomMode,
    RenderMode,
    runConnectedCallback,
    runRenderedCallback,
    VM,
    VMState,
} from './vm';
import {
    VBaseElement,
    VComment,
    VCustomElement,
    VElement,
    VNode,
    VNodes,
    VNodeType,
    VSlot,
    VText,
} from './vnodes';

import { patchProps } from './modules/props';
import { applyEventListeners } from './modules/events';
import { renderComponent } from './component';

// These values are the ones from Node.nodeType (https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType)
const enum EnvNodeTypes {
    ELEMENT = 1,
    TEXT = 3,
    COMMENT = 8,
}

// flag indicating if the hydration recovered from the DOM mismatch
let hasMismatch = false;

export function hydrateRoot(vm: VM) {
    hasMismatch = false;

    runConnectedCallback(vm);
    hydrateVM(vm);

    if (hasMismatch) {
        logError('Hydration completed with errors.', vm);
    }
}

function hydrateVM(vm: VM) {
    const children = renderComponent(vm);
    vm.children = children;

    const parentNode = vm.renderRoot;

    hydrateChildren(getFirstChild(parentNode), children, parentNode, vm);
    runRenderedCallback(vm);
}

function hydrateNode(node: Node, vnode: VNode, owner: VM): Node | null {
    let hydratedNode;
    switch (vnode.type) {
        case VNodeType.Text:
            hydratedNode = hydrateText(node, vnode, owner);
            break;

        case VNodeType.Comment:
            hydratedNode = hydrateComment(node, vnode, owner);
            break;

        case VNodeType.Slot:
            hydratedNode = hydrateSlot(node, vnode, owner);
            break;

        case VNodeType.Element:
            hydratedNode = hydrateElement(node, vnode, owner);
            break;

        case VNodeType.CustomElement:
            hydratedNode = hydrateCustomElement(node, vnode, owner);
            break;
    }

    return nextSibling(hydratedNode);
}

function hydrateText(node: Node, vnode: VText, owner: VM): Node {
    if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.TEXT, owner)) {
        return handleMismatch(node, vnode, owner);
    }

    if (process.env.NODE_ENV !== 'production') {
        const nodeValue = getProperty(node, 'nodeValue');

        if (nodeValue !== vnode.text && !(nodeValue === '\u200D' && vnode.text === '')) {
            logWarn(
                'Hydration mismatch: text values do not match, will recover from the difference',
                owner
            );
        }
    }

    setText(node, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateComment(node: Node, vnode: VComment, owner: VM): Node {
    if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.COMMENT, owner)) {
        return handleMismatch(node, vnode, owner);
    }

    if (process.env.NODE_ENV !== 'production') {
        const nodeValue = getProperty(node, 'nodeValue');

        if (nodeValue !== vnode.text) {
            logWarn(
                'Hydration mismatch: comment values do not match, will recover from the difference',
                owner
            );
        }
    }

    setProperty(node, 'nodeValue', vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateSlot(node: Node, vnode: VSlot, vm: VM): Node {
    const { aChildren, owner } = vnode;

    // weather to render the slotted content or the default slot content.
    const children: VNodes = isUndefined(aChildren) ? vnode.children : aChildren;

    // default content is part of vm.
    const slottedContentOwnerVM = isUndefined(aChildren) ? vm : owner!;

    if (vm.renderMode === RenderMode.Light) {
        hydrateChildren(node, children, node.parentNode as Element, slottedContentOwnerVM, false);

        const cl = children.length;
        // last element of a slot in light dom is an empty text node.
        return cl ? children[cl - 1]!.elm! : node;
    }

    if (
        !hasCorrectNodeType<Element>(vnode, node, EnvNodeTypes.ELEMENT, vm) ||
        !isMatchingElement(vnode, node, vm)
    ) {
        return handleMismatch(node, vnode, vm);
    }

    vnode.elm = node;
    patchElementPropsAndAttrs(vnode);
    hydrateChildren(getFirstChild(node), children, node, slottedContentOwnerVM);

    return node;
}

function hydrateElement(elm: Node, vnode: VElement, owner: VM): Node {
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT, owner) ||
        !isMatchingElement(vnode, elm, owner)
    ) {
        return handleMismatch(elm, vnode, owner);
    }

    vnode.elm = elm;

    const { context } = vnode.data;
    const isDomManual = Boolean(
        !isUndefined(context) && !isUndefined(context.lwc) && context.lwc.dom === LwcDomMode.Manual
    );

    if (isDomManual) {
        // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
        // remove the innerHTML from props so it reuses the existing dom elements.
        const { props } = vnode.data;
        if (!isUndefined(props) && !isUndefined(props.innerHTML)) {
            if (getProperty(elm, 'innerHTML') === props.innerHTML) {
                // Do a shallow clone since VNodeData may be shared across VNodes due to hoist optimization
                vnode.data = {
                    ...vnode.data,
                    props: cloneAndOmitKey(props, 'innerHTML'),
                };
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    logWarn(
                        `Mismatch hydrating element <${getProperty(
                            elm,
                            'tagName'
                        ).toLowerCase()}>: innerHTML values do not match for element, will recover from the difference`,
                        owner
                    );
                }
            }
        }
    }

    patchElementPropsAndAttrs(vnode);

    if (!isDomManual) {
        hydrateChildren(getFirstChild(elm), vnode.children, elm, owner);
    }

    return elm;
}

function hydrateCustomElement(elm: Node, vnode: VCustomElement, owner: VM): Node {
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT, owner) ||
        !isMatchingElement(vnode, elm, owner)
    ) {
        return handleMismatch(elm, vnode, owner);
    }

    const { sel, mode, ctor } = vnode;

    const vm = createVM(elm, ctor, {
        mode,
        owner,
        tagName: sel,
        hydrated: true,
    });

    vnode.elm = elm;
    vnode.vm = vm;

    allocateChildren(vnode, vm, owner);
    patchElementPropsAndAttrs(vnode);

    // Insert hook section:
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
    }
    runConnectedCallback(vm);

    if (vm.renderMode !== RenderMode.Light) {
        // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
        // Note: for Light DOM, this is handled while hydrating the VM
        hydrateChildren(getFirstChild(elm), vnode.children, elm, vm);
    }

    hydrateVM(vm);
    return elm;
}

function hydrateChildren(
    node: Node | null,
    children: VNodes,
    parentNode: Element | ShadowRoot,
    owner: VM,
    hydrateAllSiblings = true
) {
    let hasWarned = false;
    let nextNode: Node | null = node;
    let anchor: Node | null = null;
    for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];

        if (!isNull(childVnode)) {
            if (nextNode) {
                nextNode = hydrateNode(nextNode, childVnode, owner);
                anchor = childVnode.elm!;
            } else {
                hasMismatch = true;
                if (process.env.NODE_ENV !== 'production') {
                    if (!hasWarned) {
                        hasWarned = true;
                        logError(
                            `Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.`,
                            owner
                        );
                    }
                }
                mount(childVnode, parentNode, anchor, owner);
                anchor = childVnode.elm!;
            }
        }
    }

    if (hydrateAllSiblings && nextNode) {
        hasMismatch = true;
        if (process.env.NODE_ENV !== 'production') {
            if (!hasWarned) {
                logError(
                    `Hydration mismatch: incorrect number of rendered nodes. Server rendered more nodes than the client.`,
                    owner
                );
            }
        }
        do {
            const current = nextNode;
            nextNode = nextSibling(nextNode);
            removeNode(current, parentNode);
        } while (nextNode);
    }
}

function handleMismatch(node: Node, vnode: VNode, owner: VM, msg?: string): Node {
    hasMismatch = true;
    if (!isUndefined(msg)) {
        if (process.env.NODE_ENV !== 'production') {
            logError(msg, owner);
        }
    }
    const parentNode = getProperty(node, 'parentNode');
    mount(vnode, parentNode, node, owner);
    removeNode(node, parentNode);

    return vnode.elm!;
}

function patchElementPropsAndAttrs(vnode: VBaseElement) {
    applyEventListeners(vnode);
    patchProps(null, vnode);
}

function hasCorrectNodeType<T extends Node>(
    vnode: VNode,
    node: Node,
    nodeType: number,
    owner: VM
): node is T {
    if (getProperty(node, 'nodeType') !== nodeType) {
        if (process.env.NODE_ENV !== 'production') {
            logError('Hydration mismatch: incorrect node type received', owner);
        }
        return false;
    }

    return true;
}

function isMatchingElement(vnode: VBaseElement, elm: Element, owner: VM) {
    if (vnode.sel.toLowerCase() !== getProperty(elm, 'tagName').toLowerCase()) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Hydration mismatch: expecting element with tag "${vnode.sel.toLowerCase()}" but found "${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}".`,
                owner
            );
        }

        return false;
    }

    const hasIncompatibleAttrs = validateAttrs(vnode, elm, owner);
    const hasIncompatibleClass = validateClassAttr(vnode, elm, owner);
    const hasIncompatibleStyle = validateStyleAttr(vnode, elm, owner);

    return hasIncompatibleAttrs && hasIncompatibleClass && hasIncompatibleStyle;
}

function validateAttrs(vnode: VBaseElement, elm: Element, owner: VM): boolean {
    const {
        data: { attrs = {} },
    } = vnode;

    let nodesAreCompatible = true;

    // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
    for (const [attrName, attrValue] of Object.entries(attrs)) {
        const elmAttrValue = getAttribute(elm, attrName);
        if (String(attrValue) !== elmAttrValue) {
            if (process.env.NODE_ENV !== 'production') {
                logError(
                    `Mismatch hydrating element <${getProperty(
                        elm,
                        'tagName'
                    ).toLowerCase()}>: attribute "${attrName}" has different values, expected "${attrValue}" but found "${elmAttrValue}"`,
                    owner
                );
            }
            nodesAreCompatible = false;
        }
    }

    return nodesAreCompatible;
}

function validateClassAttr(vnode: VBaseElement, elm: Element, owner: VM): boolean {
    const {
        data: { className, classMap },
    } = vnode;

    let nodesAreCompatible = true;
    let vnodeClassName;

    if (!isUndefined(className) && String(className) !== getProperty(elm, 'className')) {
        // className is used when class is bound to an expr.
        nodesAreCompatible = false;
        vnodeClassName = className;
    } else if (!isUndefined(classMap)) {
        // classMap is used when class is set to static value.
        const classList = getClassList(elm);
        let computedClassName = '';

        // all classes from the vnode should be in the element.classList
        for (const name in classMap) {
            computedClassName += ' ' + name;
            if (!classList.contains(name)) {
                nodesAreCompatible = false;
            }
        }

        vnodeClassName = computedClassName.trim();

        if (classList.length > keys(classMap).length) {
            nodesAreCompatible = false;
        }
    }

    if (!nodesAreCompatible) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Mismatch hydrating element <${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}>: attribute "class" has different values, expected "${vnodeClassName}" but found "${getProperty(
                    elm,
                    'className'
                )}"`,
                owner
            );
        }
    }

    return nodesAreCompatible;
}

function validateStyleAttr(vnode: VBaseElement, elm: Element, owner: VM): boolean {
    const {
        data: { style, styleDecls },
    } = vnode;
    const elmStyle = getAttribute(elm, 'style') || '';
    let vnodeStyle;
    let nodesAreCompatible = true;

    if (!isUndefined(style) && style !== elmStyle) {
        nodesAreCompatible = false;
        vnodeStyle = style;
    } else if (!isUndefined(styleDecls)) {
        const parsedVnodeStyle = parseStyleText(elmStyle);
        const expectedStyle = [];
        // styleMap is used when style is set to static value.
        for (let i = 0, n = styleDecls.length; i < n; i++) {
            const [prop, value, important] = styleDecls[i];
            expectedStyle.push(`${prop}: ${value + (important ? ' important!' : '')}`);

            const parsedPropValue = parsedVnodeStyle[prop];

            if (isUndefined(parsedPropValue)) {
                nodesAreCompatible = false;
            } else if (!parsedPropValue.startsWith(value)) {
                nodesAreCompatible = false;
            } else if (important && !parsedPropValue.endsWith('!important')) {
                nodesAreCompatible = false;
            }
        }

        if (keys(parsedVnodeStyle).length > styleDecls.length) {
            nodesAreCompatible = false;
        }

        vnodeStyle = ArrayJoin.call(expectedStyle, ';');
    }

    if (!nodesAreCompatible) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Mismatch hydrating element <${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}>: attribute "style" has different values, expected "${vnodeStyle}" but found "${elmStyle}".`,
                owner
            );
        }
    }

    return nodesAreCompatible;
}
