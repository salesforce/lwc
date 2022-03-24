/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, ArrayJoin, assert, keys, isNull } from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';

import { cloneAndOmitKey, parseStyleText } from './utils';
import { allocateChildren, mount, removeNode } from './rendering';
import {
    createVM,
    runConnectedCallback,
    VMState,
    RenderMode,
    LwcDomMode,
    VM,
    runRenderedCallback,
} from './vm';
import {
    VNodes,
    VBaseElement,
    VNode,
    VNodeType,
    VText,
    VComment,
    VElement,
    VCustomElement,
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

    const {
        renderer: { getFirstChild },
    } = vm;
    hydrateChildren(getFirstChild(parentNode), children, parentNode, vm);
    runRenderedCallback(vm);
}

function hydrateNode(node: Node, vnode: VNode): Node | null {
    let hydratedNode;
    switch (vnode.type) {
        case VNodeType.Text:
            hydratedNode = hydrateText(node, vnode);
            break;

        case VNodeType.Comment:
            hydratedNode = hydrateComment(node, vnode);
            break;

        case VNodeType.Element:
            hydratedNode = hydrateElement(node, vnode);
            break;

        case VNodeType.CustomElement:
            hydratedNode = hydrateCustomElement(node, vnode);
            break;
    }
    const {
        renderer: { nextSibling },
    } = vnode;
    return nextSibling(hydratedNode);
}

function hydrateText(node: Node, vnode: VText): Node | null {
    if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.TEXT)) {
        return handleMismatch(node, vnode);
    }

    if (process.env.NODE_ENV !== 'production') {
        const {
            renderer: { getProperty },
        } = vnode;
        const nodeValue = getProperty(node, 'nodeValue');

        if (nodeValue !== vnode.text && !(nodeValue === '\u200D' && vnode.text === '')) {
            logWarn(
                'Hydration mismatch: text values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }
    const {
        renderer: { setText },
    } = vnode;
    setText(node, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateComment(node: Node, vnode: VComment): Node | null {
    if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.COMMENT)) {
        return handleMismatch(node, vnode);
    }

    if (process.env.NODE_ENV !== 'production') {
        const {
            renderer: { getProperty },
        } = vnode;
        const nodeValue = getProperty(node, 'nodeValue');

        if (nodeValue !== vnode.text) {
            logWarn(
                'Hydration mismatch: comment values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }

    const {
        renderer: { setProperty },
    } = vnode;
    setProperty(node, 'nodeValue', vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateElement(elm: Node, vnode: VElement): Node | null {
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT) ||
        !isMatchingElement(vnode, elm)
    ) {
        return handleMismatch(elm, vnode);
    }

    vnode.elm = elm;

    const { context } = vnode.data;
    const isDomManual = Boolean(
        !isUndefined(context) && !isUndefined(context.lwc) && context.lwc.dom === LwcDomMode.Manual
    );

    if (isDomManual) {
        // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
        // remove the innerHTML from props so it reuses the existing dom elements.
        const {
            data: { props },
            renderer: { getProperty },
        } = vnode;
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
                        vnode.owner
                    );
                }
            }
        }
    }

    patchElementPropsAndAttrs(vnode);

    if (!isDomManual) {
        const {
            renderer: { getFirstChild },
        } = vnode;
        hydrateChildren(getFirstChild(elm), vnode.children, elm, vnode.owner);
    }

    return elm;
}

function hydrateCustomElement(elm: Node, vnode: VCustomElement): Node | null {
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT) ||
        !isMatchingElement(vnode, elm)
    ) {
        return handleMismatch(elm, vnode);
    }

    const { sel, mode, ctor, owner, renderer } = vnode;

    const vm = createVM(elm, ctor, renderer, {
        mode,
        owner,
        tagName: sel,
        hydrated: true,
    });

    vnode.elm = elm;
    vnode.vm = vm;

    allocateChildren(vnode, vm);
    patchElementPropsAndAttrs(vnode);

    // Insert hook section:
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
    }
    runConnectedCallback(vm);

    if (vm.renderMode !== RenderMode.Light) {
        const {
            renderer: { getFirstChild },
        } = vnode;
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
    owner: VM
) {
    let hasWarned = false;
    let nextNode: Node | null = node;
    let anchor: Node | null = null;
    for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];

        if (!isNull(childVnode)) {
            if (nextNode) {
                nextNode = hydrateNode(nextNode, childVnode);
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
                mount(childVnode, parentNode, anchor);
                anchor = childVnode.elm!;
            }
        }
    }

    if (nextNode) {
        hasMismatch = true;
        if (process.env.NODE_ENV !== 'production') {
            if (!hasWarned) {
                logError(
                    `Hydration mismatch: incorrect number of rendered nodes. Server rendered more nodes than the client.`,
                    owner
                );
            }
        }
        const { renderer } = owner;
        const { nextSibling } = renderer;
        do {
            const current = nextNode;
            nextNode = nextSibling(nextNode);
            removeNode(current, parentNode, renderer);
        } while (nextNode);
    }
}

function handleMismatch(node: Node, vnode: VNode, msg?: string): Node | null {
    hasMismatch = true;
    if (!isUndefined(msg)) {
        if (process.env.NODE_ENV !== 'production') {
            logError(msg, vnode.owner);
        }
    }
    const { renderer } = vnode;
    const { getProperty } = renderer;
    const parentNode = getProperty(node, 'parentNode');
    mount(vnode, parentNode, node);
    removeNode(node, parentNode, renderer);

    return vnode.elm!;
}

function patchElementPropsAndAttrs(vnode: VBaseElement) {
    applyEventListeners(vnode);
    patchProps(null, vnode);
}

function hasCorrectNodeType<T extends Node>(vnode: VNode, node: Node, nodeType: number): node is T {
    const {
        renderer: { getProperty },
    } = vnode;
    if (getProperty(node, 'nodeType') !== nodeType) {
        if (process.env.NODE_ENV !== 'production') {
            logError('Hydration mismatch: incorrect node type received', vnode.owner);
        }
        return false;
    }

    return true;
}

function isMatchingElement(vnode: VBaseElement, elm: Element) {
    const {
        renderer: { getProperty },
    } = vnode;
    if (vnode.sel.toLowerCase() !== getProperty(elm, 'tagName').toLowerCase()) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Hydration mismatch: expecting element with tag "${vnode.sel.toLowerCase()}" but found "${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}".`,
                vnode.owner
            );
        }

        return false;
    }

    const hasIncompatibleAttrs = validateAttrs(vnode, elm);
    const hasIncompatibleClass = validateClassAttr(vnode, elm);
    const hasIncompatibleStyle = validateStyleAttr(vnode, elm);

    return hasIncompatibleAttrs && hasIncompatibleClass && hasIncompatibleStyle;
}

function validateAttrs(vnode: VBaseElement, elm: Element): boolean {
    const {
        data: { attrs = {} },
    } = vnode;

    let nodesAreCompatible = true;

    // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
    for (const [attrName, attrValue] of Object.entries(attrs)) {
        const {
            renderer: { getAttribute },
        } = vnode;
        const elmAttrValue = getAttribute(elm, attrName);
        if (String(attrValue) !== elmAttrValue) {
            if (process.env.NODE_ENV !== 'production') {
                const {
                    renderer: { getProperty },
                } = vnode;
                logError(
                    `Mismatch hydrating element <${getProperty(
                        elm,
                        'tagName'
                    ).toLowerCase()}>: attribute "${attrName}" has different values, expected "${attrValue}" but found "${elmAttrValue}"`,
                    vnode.owner
                );
            }
            nodesAreCompatible = false;
        }
    }

    return nodesAreCompatible;
}

function validateClassAttr(vnode: VBaseElement, elm: Element): boolean {
    const {
        data: { className, classMap },
        renderer: { getProperty, getClassList },
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
                vnode.owner
            );
        }
    }

    return nodesAreCompatible;
}

function validateStyleAttr(vnode: VBaseElement, elm: Element): boolean {
    const {
        data: { style, styleDecls },
        renderer: { getAttribute },
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
            const {
                renderer: { getProperty },
            } = vnode;
            logError(
                `Mismatch hydrating element <${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}>: attribute "style" has different values, expected "${vnodeStyle}" but found "${elmStyle}".`,
                vnode.owner
            );
        }
    }

    return nodesAreCompatible;
}
