/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArrayFilter, ArrayJoin, assert, isUndefined, keys } from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';
import {
    VBaseElement,
    VComment,
    VCustomElement,
    VElement,
    VNode,
    VNodes,
    VNodeType,
    VText,
} from '../3rdparty/snabbdom/types';

import { parseStyleText } from './utils';
import { getComponentInternalDef } from './def';
import { allocateCustomElementChildren } from './rendering';
import { patchProps } from './modules/props';
import { applyEventListeners } from './modules/events';
import {
    createVM,
    getAssociatedVM,
    hydrateVM,
    LWCDOMMode,
    RenderMode,
    runConnectedCallback,
    VM,
    VMState,
} from './vm';

function hydrate(vnode: VNode, node: Node) {
    switch (vnode.type) {
        case VNodeType.Text:
            processText(vnode, node);
            break;

        case VNodeType.Comment:
            processComment(vnode, node);
            break;

        case VNodeType.Element:
            processElement(vnode, node);
            break;

        case VNodeType.CustomElement:
            processCustomElement(vnode, node);
            break;
    }
}

function processText(vnode: VText, node: Node) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line lwc-internal/no-global-node
        if (node.nodeType !== Node.TEXT_NODE) {
            logError('Hydration mismatch: incorrect node type received', vnode.owner);
            assert.fail('Hydration mismatch: incorrect node type received.');
        }

        if (node.nodeValue !== vnode.text) {
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

function processComment(vnode: VComment, node: Node) {
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line lwc-internal/no-global-node
        if (node.nodeType !== Node.COMMENT_NODE) {
            logError('Hydration mismatch: incorrect node type received', vnode.owner);
            assert.fail('Hydration mismatch: incorrect node type received.');
        }

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

function processElement(vnode: VElement, node: Node) {
    const elm = node as Element;
    vnode.elm = elm;

    const { context } = vnode.data;
    const isDomManual = Boolean(
        !isUndefined(context) && !isUndefined(context.lwc) && context.lwc.dom === LWCDOMMode.manual
    );

    if (isDomManual) {
        // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
        // remove the innerHTML from props so it reuses the existing dom elements.
        const { props } = vnode.data;
        if (!isUndefined(props) && !isUndefined(props.innerHTML)) {
            if (elm.innerHTML === props.innerHTML) {
                delete props.innerHTML;
            } else {
                logWarn(
                    `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: innerHTML values do not match for element, will recover from the difference`,
                    vnode.owner
                );
            }
        }
    }

    hydrateElementAttrsAndProps(vnode);

    if (!isDomManual) {
        hydrateChildren(vnode.elm.childNodes, vnode.children, vnode.owner);
    }
}

function processCustomElement(vnode: VCustomElement, node: Node) {
    const elm = node as Element;

    // the element is created, but the vm is not
    const { sel, mode, ctor, owner } = vnode;

    const def = getComponentInternalDef(ctor);
    createVM(elm, def, {
        mode,
        owner,
        tagName: sel,
        renderer: owner.renderer,
    });

    vnode.elm = elm as Element;

    const vm = getAssociatedVM(elm);
    allocateCustomElementChildren(vnode, vm);

    hydrateElementAttrsAndProps(vnode);

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

function hydrateElementAttrsAndProps(vnode: VBaseElement) {
    applyEventListeners(vnode);
    patchProps(null, vnode);
}

export function hydrateChildren(elmChildren: NodeListOf<ChildNode>, children: VNodes, vm?: VM) {
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
    let elmCurrentChildIdx = 0;
    for (let j = 0, n = children.length; j < n; j++) {
        const ch = children[j];
        if (ch != null) {
            const childNode = elmChildren[elmCurrentChildIdx];
            if (process.env.NODE_ENV !== 'production') {
                // VComments and VTexts validation is handled in their hooks
                if (isElementNode(childNode)) {
                    if (ch.sel?.toLowerCase() !== childNode.tagName.toLowerCase()) {
                        logError(
                            `Hydration mismatch: expecting element with tag "${ch.sel?.toLowerCase()}" but found "${childNode.tagName.toLowerCase()}".`,
                            vm
                        );
                        throwHydrationError();
                    }
                    // Note: props are not yet set
                    const hasIncompatibleAttrs = vnodesAndElementHaveCompatibleAttrs(ch, childNode);
                    const hasIncompatibleClass = vnodesAndElementHaveCompatibleClass(ch, childNode);
                    const hasIncompatibleStyle = vnodesAndElementHaveCompatibleStyle(ch, childNode);
                    const isVNodeAndElementCompatible =
                        hasIncompatibleAttrs && hasIncompatibleClass && hasIncompatibleStyle;
                    if (!isVNodeAndElementCompatible) {
                        throwHydrationError();
                    }
                }
            }

            hydrate(ch, childNode);
            elmCurrentChildIdx++;
        }
    }
}

function isElementNode(node: ChildNode): node is Element {
    // eslint-disable-next-line lwc-internal/no-global-node
    return node.nodeType === Node.ELEMENT_NODE;
}

function vnodesAndElementHaveCompatibleAttrs(vnode: VNode, elm: Element): boolean {
    const {
        data: { attrs = {} },
        owner: { renderer },
    } = vnode;

    let nodesAreCompatible = true;

    // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
    for (const [attrName, attrValue] of Object.entries(attrs)) {
        const elmAttrValue = renderer.getAttribute(elm, attrName);
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

function vnodesAndElementHaveCompatibleClass(vnode: VNode, elm: Element): boolean {
    const {
        data: { className, classMap },
        owner: { renderer },
    } = vnode;

    let nodesAreCompatible = true;
    let vnodeClassName;

    if (!isUndefined(className) && String(className) !== elm.className) {
        // className is used when class is bound to an expr.
        nodesAreCompatible = false;
        vnodeClassName = className;
    } else if (!isUndefined(classMap)) {
        // classMap is used when class is set to static value.
        const classList = renderer.getClassList(elm);
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

function vnodesAndElementHaveCompatibleStyle(vnode: VNode, elm: Element): boolean {
    const {
        data: { style, styleDecls },
        owner: { renderer },
    } = vnode;
    const elmStyle = renderer.getAttribute(elm, 'style') || '';
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

function throwHydrationError() {
    assert.fail('Server rendered elements do not match client side generated elements');
}
