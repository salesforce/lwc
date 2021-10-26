/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayFilter, assert, isArray, isNull, isUndefined, noop } from '@lwc/shared';
import { EmptyArray } from './utils';
import {
    createVM,
    allocateInSlot,
    runWithBoundaryProtection,
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
        owner.renderer.getClassList(elm).add(token);
    }
}

export function updateNodeHook(oldVnode: VNode, vnode: VNode) {
    const {
        elm,
        text,
        owner: { renderer },
    } = vnode;

    if (oldVnode.text !== text) {
        if (process.env.NODE_ENV !== 'production') {
            unlockDomMutation();
        }
        renderer.setText(elm, text!);
        if (process.env.NODE_ENV !== 'production') {
            lockDomMutation();
        }
    }
}

export function insertNodeHook(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    const { renderer } = vnode.owner;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.insert(vnode.elm!, parentNode, referenceNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function removeNodeHook(vnode: VNode, parentNode: Node) {
    const { renderer } = vnode.owner;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.remove(vnode.elm!, parentNode);
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
    const { children, owner } = vnode;
    const fn = hasDynamicChildren(children) ? updateDynamicChildren : updateStaticChildren;
    runWithBoundaryProtection(
        owner,
        owner.owner,
        noop,
        () => {
            fn(vnode.elm!, oldVnode.children, children);
        },
        noop
    );
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
        renderer: owner.renderer,
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
    // @todo: should the hydrate be part of engine-dom? can we move hydrate out of the hooks?
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
        if (attrValue !== elmAttrValue) {
            logError(
                `Error hydrating element: attribute "${attrName}" has different values, expected "${attrValue}" but found "${elmAttrValue}"`,
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

    if (!isUndefined(className) && className !== elm.className) {
        // @todo: not sure if the above comparison is correct, maybe we should normalize to classlist
        // className is used when class is bound to an expr.
        logError(
            `Mismatch hydrating element: attribute "class" has different values, expected "${className}" but found "${elm.className}"`,
            vnode.owner
        );
        nodesAreCompatible = false;
    } else if (!isUndefined(classMap)) {
        // classMap is used when class is set to static value.
        // @todo: there might be a simpler method to do this.
        const classList = renderer.getClassList(elm);
        let hasClassMismatch = false;
        let computedClassName = '';

        // all classes from the vnode should be in the element.classList
        for (const name in classMap) {
            computedClassName += ' ' + name;
            if (!classList.contains(name)) {
                nodesAreCompatible = false;
                hasClassMismatch = true;
            }
        }

        // all classes from element.classList should be in the vnode classMap
        classList.forEach((name) => {
            if (!classMap[name]) {
                nodesAreCompatible = false;
                hasClassMismatch = true;
            }
        });

        if (hasClassMismatch) {
            logError(
                `Mismatch hydrating element: attribute "class" has different values, expected "${computedClassName.trim()}" but found "${
                    elm.className
                }"`,
                vnode.owner
            );
        }
    }

    return nodesAreCompatible;
}

function vnodesAndElementHaveCompatibleStyle(vnode: VNode, elm: Element): boolean {
    const {
        data: { style, styleDecls },
        owner: { renderer },
    } = vnode;
    const elmStyle = renderer.getAttribute(elm, 'style');
    let nodesAreCompatible = true;

    // @todo: question: would it be the same or is there a chance that the browser tweak the result of elm.setAttribute('style', ...)?
    //        ex: such "str" exist that after elm.setAttribute('style', str), elm.getAttribute('style') !== str.
    if (!isUndefined(style) && style !== elmStyle) {
        // style is used when class is bound to an expr.
        logError(
            `Mismatch hydrating element: attribute "style" has different values, expected "${style}" but found "${elmStyle}".`,
            vnode.owner
        );
        nodesAreCompatible = false;
    } else if (!isUndefined(styleDecls)) {
        // styleMap is used when class is set to static value.
        for (let i = 0; i < styleDecls.length; i++) {
            const [prop, value, important] = styleDecls[i];
            const elmPropValue = (elm as HTMLElement).style.getPropertyValue(prop);
            const elmPropPriority = (elm as HTMLElement).style.getPropertyPriority(prop);
            if (value !== elmPropValue || important !== (elmPropPriority === 'important')) {
                nodesAreCompatible = false;
            }
        }

        // questions: is there a way to check that only those props in styleMap are set in the element?
        //            how to generate the style?
        logError('Error hydrating element: attribute "style" has different values.', vnode.owner);
    }

    return nodesAreCompatible;
}

function throwHydrationError() {
    // @todo: maybe create a type for these type of hydration errors
    assert.fail('Server rendered elements do not match client side generated elements');
}

export function hydrateChildrenHook(elmChildren: NodeListOf<ChildNode>, children: VNodes, vm?: VM) {
    if (process.env.NODE_ENV !== 'production') {
        const filteredVNodes = ArrayFilter.call(children, (vnode) => !!vnode);

        if (elmChildren.length !== filteredVNodes.length) {
            logError(
                `Hydration mismatch: incorrect number of rendered elements, expected ${filteredVNodes.length} but found ${elmChildren.length}.`,
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
                            `Hydration mismatch: expecting element with tag "${ch.sel}" but found "${childNode.tagName}".`,
                            vm
                        );

                        throwHydrationError();
                    }

                    // Note: props are not yet set
                    const isVNodeAndElementCompatible =
                        vnodesAndElementHaveCompatibleAttrs(ch, childNode) &&
                        vnodesAndElementHaveCompatibleClass(ch, childNode) &&
                        vnodesAndElementHaveCompatibleStyle(ch, childNode);

                    if (!isVNodeAndElementCompatible) {
                        logError(
                            `Hydration mismatch: incompatible attributes for element with tag "${childNode.tagName}".`,
                            vm
                        );

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
