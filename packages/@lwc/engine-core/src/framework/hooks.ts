/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayFilter, ArrayJoin, assert, isArray, isNull, isUndefined, keys } from '@lwc/shared';
import { getClassList, setText, getAttribute, remove, insert } from '../renderer';
import { EmptyArray, parseStyleText } from './utils';
import {
    createVM,
    allocateInSlot,
    getAssociatedVMIfPresent,
    VM,
    ShadowMode,
    RenderMode,
} from './vm';
import { VNode, VCustomElement, VElement, VNodes } from '../3rdparty/snabbdom/types';
import modEvents from './modules/events';
import modAttrs from './modules/attrs';
import modProps from './modules/props';
import modComputedClassName from './modules/computed-class-attr';
import modComputedStyle from './modules/computed-style-attr';
import modStaticClassName from './modules/static-class-attr';
import modStaticStyle from './modules/static-style-attr';
import { updateDynamicChildren, updateStaticChildren } from '../3rdparty/snabbdom/snabbdom';
import { patchElementWithRestrictions, unlockDomMutation, lockDomMutation } from './restrictions';
import { getComponentInternalDef } from './def';
import { logError } from '../shared/logger';

function observeElementChildNodes(elm: Element) {
    (elm as any).$domManual$ = true;
}

function setElementShadowToken(elm: Element, token: string | undefined) {
    (elm as any).$shadowToken$ = token;
}

// Set the scope token class for *.scoped.css styles
function setScopeTokenClassIfNecessary(elm: Element, owner: VM) {
    const { cmpTemplate, context } = owner;
    const token = cmpTemplate?.stylesheetToken;
    if (!isUndefined(token) && context.hasScopedStyles) {
        getClassList(elm).add(token);
    }
}

export function updateNodeHook(oldVnode: VNode, vnode: VNode) {
    const { elm, text } = vnode;

    if (oldVnode.text !== text) {
        if (process.env.NODE_ENV !== 'production') {
            unlockDomMutation();
        }
        setText(elm, text!);
        if (process.env.NODE_ENV !== 'production') {
            lockDomMutation();
        }
    }
}

export function insertNodeHook(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    insert(vnode.elm!, parentNode, referenceNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function removeNodeHook(vnode: VNode, parentNode: Node) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    remove(vnode.elm!, parentNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function createElmHook(vnode: VElement) {
    modEvents.create(vnode);
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.create(vnode);
    modProps.create(vnode);
    modStaticClassName.create(vnode);
    modStaticStyle.create(vnode);
    modComputedClassName.create(vnode);
    modComputedStyle.create(vnode);
}

export const enum LWCDOMMode {
    manual = 'manual',
}

export function hydrateElmHook(vnode: VElement) {
    modEvents.create(vnode);
    // Attrs are already on the element.
    // modAttrs.create(vnode);
    modProps.create(vnode);
    // Already set.
    // modStaticClassName.create(vnode);
    // modStaticStyle.create(vnode);
    // modComputedClassName.create(vnode);
    // modComputedStyle.create(vnode);
}

export function fallbackElmHook(elm: Element, vnode: VElement) {
    const { owner } = vnode;
    setScopeTokenClassIfNecessary(elm, owner);
    if (owner.shadowMode === ShadowMode.Synthetic) {
        const {
            data: { context },
        } = vnode;
        const { stylesheetToken } = owner.context;
        if (
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LWCDOMMode.manual
        ) {
            // this element will now accept any manual content inserted into it
            observeElementChildNodes(elm);
        }
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, stylesheetToken);
    }
    if (process.env.NODE_ENV !== 'production') {
        const {
            data: { context },
        } = vnode;
        const isPortal =
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LWCDOMMode.manual;
        const isLight = owner.renderMode === RenderMode.Light;
        patchElementWithRestrictions(elm, { isPortal, isLight });
    }
}

export function updateElmHook(oldVnode: VElement, vnode: VElement) {
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.update(oldVnode, vnode);
    modProps.update(oldVnode, vnode);
    modComputedClassName.update(oldVnode, vnode);
    modComputedStyle.update(oldVnode, vnode);
}

export function updateChildrenHook(oldVnode: VElement, vnode: VElement) {
    const { elm, children } = vnode;
    if (hasDynamicChildren(children)) {
        updateDynamicChildren(elm!, oldVnode.children, children);
    } else {
        updateStaticChildren(elm!, oldVnode.children, children);
    }
}

export function allocateChildrenHook(vnode: VCustomElement, vm: VM) {
    // A component with slots will re-render because:
    // 1- There is a change of the internal state.
    // 2- There is a change on the external api (ex: slots)
    //
    // In case #1, the vnodes in the cmpSlots will be reused since they didn't changed. This routine emptied the
    // slotted children when those VCustomElement were rendered and therefore in subsequent calls to allocate children
    // in a reused VCustomElement, there won't be any slotted children.
    // For those cases, we will use the reference for allocated children stored when rendering the fresh VCustomElement.
    //
    // In case #2, we will always get a fresh VCustomElement.
    const children = vnode.aChildren || vnode.children;

    vm.aChildren = children;

    const { renderMode, shadowMode } = vm;
    if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
        // slow path
        allocateInSlot(vm, children);
        // save the allocated children in case this vnode is reused.
        vnode.aChildren = children;
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
}

export function createViewModelHook(elm: HTMLElement, vnode: VCustomElement) {
    if (!isUndefined(getAssociatedVMIfPresent(elm))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here since this hook is called right after invoking `document.createElement`.
        return;
    }
    const { sel, mode, ctor, owner } = vnode;
    setScopeTokenClassIfNecessary(elm, owner);
    if (owner.shadowMode === ShadowMode.Synthetic) {
        const { stylesheetToken } = owner.context;
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, stylesheetToken);
    }
    const def = getComponentInternalDef(ctor);
    createVM(elm, def, {
        mode,
        owner,
        tagName: sel,
    });
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isArray(vnode.children),
            `Invalid vnode for a custom element, it must have children defined.`
        );
    }
}

export function createCustomElmHook(vnode: VCustomElement) {
    modEvents.create(vnode);
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.create(vnode);
    modProps.create(vnode);
    modStaticClassName.create(vnode);
    modStaticStyle.create(vnode);
    modComputedClassName.create(vnode);
    modComputedStyle.create(vnode);
}

export function createChildrenHook(vnode: VElement) {
    const { elm, children } = vnode;
    for (let j = 0; j < children.length; ++j) {
        const ch = children[j];
        if (ch != null) {
            ch.hook.create(ch);
            ch.hook.insert(ch, elm!, null);
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

function vnodesAndElementHaveCompatibleClass(vnode: VNode, elm: Element): boolean {
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

function vnodesAndElementHaveCompatibleStyle(vnode: VNode, elm: Element): boolean {
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

function throwHydrationError() {
    assert.fail('Server rendered elements do not match client side generated elements');
}

export function hydrateChildrenHook(elmChildren: NodeListOf<ChildNode>, children: VNodes, vm?: VM) {
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

            ch.hook.hydrate(ch, childNode);
            elmCurrentChildIdx++;
        }
    }
}

export function updateCustomElmHook(oldVnode: VCustomElement, vnode: VCustomElement) {
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.update(oldVnode, vnode);
    modProps.update(oldVnode, vnode);
    modComputedClassName.update(oldVnode, vnode);
    modComputedStyle.update(oldVnode, vnode);
}

export function removeElmHook(vnode: VElement) {
    // this method only needs to search on child vnodes from template
    // to trigger the remove hook just in case some of those children
    // are custom elements.
    const { children, elm } = vnode;
    for (let j = 0, len = children.length; j < len; ++j) {
        const ch = children[j];
        if (!isNull(ch)) {
            ch.hook.remove(ch, elm!);
        }
    }
}

// Using a WeakMap instead of a WeakSet because this one works in IE11 :(
const FromIteration: WeakMap<VNodes, 1> = new WeakMap();

// dynamic children means it was generated by an iteration
// in a template, and will require a more complex diffing algo.
export function markAsDynamicChildren(children: VNodes) {
    FromIteration.set(children, 1);
}

export function hasDynamicChildren(children: VNodes): boolean {
    return FromIteration.has(children);
}
