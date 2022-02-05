/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, ArrayFilter, ArrayJoin, assert, keys, isNull } from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';
import { getAttribute, getClassList } from '../renderer';

import { cloneAndOmitKey, parseStyleText } from './utils';
import { allocateChildren } from './rendering';
import {
    createVM,
    hydrateVM,
    runConnectedCallback,
    VM,
    VMState,
    RenderMode,
    LwcDomMode,
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

function hydrate(vnode: VNode, node: Node) {
    switch (vnode.type) {
        case VNodeType.Text:
            hydrateText(vnode, node);
            break;

        case VNodeType.Comment:
            hydrateComment(vnode, node);
            break;

        case VNodeType.Element:
            hydrateElement(vnode, node);
            break;

        case VNodeType.CustomElement:
            hydrateCustomElement(vnode, node);
            break;
    }
}

function hydrateText(vnode: VText, node: Node) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line lwc-internal/no-global-node
        validateNodeType(vnode, node, Node.TEXT_NODE);

        if (node.nodeValue !== vnode.text && !(node.nodeValue === '\u200D' && vnode.text === '')) {
            logWarn(
                'Hydration mismatch: text values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }

    // always set the text value to the one from the vnode.
    node.nodeValue = vnode.text ?? null;
    vnode.elm = node;
}

function hydrateComment(vnode: VComment, node: Node) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line lwc-internal/no-global-node
        validateNodeType(vnode, node, Node.COMMENT_NODE);

        if (node.nodeValue !== vnode.text) {
            logWarn(
                'Hydration mismatch: comment values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }

    // always set the text value to the one from the vnode.
    node.nodeValue = vnode.text ?? null;
    vnode.elm = node;
}

function hydrateElement(vnode: VElement, node: Node) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line lwc-internal/no-global-node
        validateNodeType<Element>(vnode, node, Node.ELEMENT_NODE);
        validateElement(vnode, node);
    }

    const elm = node as Element;
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
            if (elm.innerHTML === props.innerHTML) {
                // Do a shallow clone since VNodeData may be shared across VNodes due to hoist optimization
                vnode.data = {
                    ...vnode.data,
                    props: cloneAndOmitKey(props, 'innerHTML'),
                };
            } else {
                logWarn(
                    `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: innerHTML values do not match for element, will recover from the difference`,
                    vnode.owner
                );
            }
        }
    }

    patchElementPropsAndAttrs(vnode);

    if (!isDomManual) {
        hydrateChildren(vnode.elm.childNodes, vnode.children, vnode.owner);
    }
}

function hydrateCustomElement(vnode: VCustomElement, node: Node) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line lwc-internal/no-global-node
        validateNodeType<Element>(vnode, node, Node.ELEMENT_NODE);
        validateElement(vnode, node);
    }

    const elm = node as Element;
    const { sel, mode, ctor, owner } = vnode;

    const vm = createVM(elm, ctor, {
        mode,
        owner,
        tagName: sel,
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
        // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
        // Note: for Light DOM, this is handled while hydrating the VM
        hydrateChildren(vnode.elm.childNodes, vnode.children, vm);
    }

    hydrateVM(vm);
}

export function hydrateChildren(elmChildren: NodeListOf<ChildNode>, children: VNodes, vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        const filteredVNodes = ArrayFilter.call(children, (vnode) => !!vnode);

        if (elmChildren.length !== filteredVNodes.length) {
            logError(
                `Hydration mismatch: incorrect number of rendered nodes, expected ${filteredVNodes.length} but found ${elmChildren.length}.`,
                vm
            );
            throwHydrationError();
        }
    }

    let childNodeIndex = 0;
    for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];

        if (!isNull(childVnode)) {
            const childNode = elmChildren[childNodeIndex];
            hydrate(childVnode, childNode);

            childNodeIndex++;
        }
    }
}

function patchElementPropsAndAttrs(vnode: VBaseElement) {
    applyEventListeners(vnode);
    patchProps(null, vnode);
}

function throwHydrationError(): never {
    assert.fail('Server rendered elements do not match client side generated elements');
}

function validateNodeType<T extends Node>(
    vnode: VNode,
    node: Node,
    nodeType: number
): asserts node is T {
    if (node.nodeType !== nodeType) {
        logError('Hydration mismatch: incorrect node type received', vnode.owner);
        assert.fail('Hydration mismatch: incorrect node type received.');
    }
}

function validateElement(vnode: VBaseElement, elm: Element) {
    if (vnode.sel.toLowerCase() !== elm.tagName.toLowerCase()) {
        logError(
            `Hydration mismatch: expecting element with tag "${vnode.sel.toLowerCase()}" but found "${elm.tagName.toLowerCase()}".`,
            vnode.owner
        );

        throwHydrationError();
    }

    const hasIncompatibleAttrs = validateAttrs(vnode, elm);
    const hasIncompatibleClass = validateClassAttr(vnode, elm);
    const hasIncompatibleStyle = validateStyleAttr(vnode, elm);
    const isVNodeAndElementCompatible =
        hasIncompatibleAttrs && hasIncompatibleClass && hasIncompatibleStyle;

    if (!isVNodeAndElementCompatible) {
        throwHydrationError();
    }
}

function validateAttrs(vnode: VBaseElement, elm: Element): boolean {
    const {
        data: { attrs = {} },
    } = vnode;

    let nodesAreCompatible = true;

    // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
    for (const [attrName, attrValue] of Object.entries(attrs)) {
        const elmAttrValue = getAttribute(elm, attrName);
        if (String(attrValue) !== elmAttrValue) {
            logError(
                `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: attribute "${attrName}" has different values, expected "${attrValue}" but found "${elmAttrValue}"`,
                vnode.owner
            );
            nodesAreCompatible = false;
        }
    }

    return nodesAreCompatible;
}

function validateClassAttr(vnode: VBaseElement, elm: Element): boolean {
    const {
        data: { className, classMap },
    } = vnode;

    let nodesAreCompatible = true;
    let vnodeClassName;

    if (!isUndefined(className) && String(className) !== elm.className) {
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
        logError(
            `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: attribute "class" has different values, expected "${vnodeClassName}" but found "${
                elm.className
            }"`,
            vnode.owner
        );
    }

    return nodesAreCompatible;
}

function validateStyleAttr(vnode: VBaseElement, elm: Element): boolean {
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
        // style is used when class is bound to an expr.
        logError(
            `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: attribute "style" has different values, expected "${vnodeStyle}" but found "${elmStyle}".`,
            vnode.owner
        );
    }

    return nodesAreCompatible;
}
