/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    // ArrayFilter,
    // ArrayJoin,
    ArrayPush,
    assert,
    create,
    isArray,
    isNull,
    isTrue,
    isUndefined,
    keys,
    KEY__SHADOW_RESOLVER,
} from '@lwc/shared';
import {
    EmptyArray,
    // parseStyleText
} from './utils';
import {
    createVM,
    getAssociatedVMIfPresent,
    VM,
    ShadowMode,
    RenderMode,
    rerenderVM,
    VMState,
    runConnectedCallback,
    appendVM,
    removeVM,
    // getAssociatedVM,
    // hydrateVM,
    getRenderRoot,
} from './vm';
import {
    VNode,
    VCustomElement,
    VElement,
    VNodes,
    Key,
    // Hooks,
    VText,
    VComment,
    // VParentElement,
    VBaseElement,
    VNodeType,
} from '../3rdparty/snabbdom/types';

import { applyEventListeners } from './modules/events';
import { patchAttributes } from './modules/attrs';
import { patchProps } from './modules/props';
import { patchClassAttribute } from './modules/computed-class-attr';
import { patchStyleAttribute } from './modules/computed-style-attr';
import { applyStaticClassAttribute } from './modules/static-class-attr';
import { applyStaticStyleAttribute } from './modules/static-style-attr';

import { patchElementWithRestrictions, unlockDomMutation, lockDomMutation } from './restrictions';
import { getComponentInternalDef } from './def';
// import { logError, logWarn } from '../shared/logger';
import { markComponentAsDirty } from './component';
import { getUpgradableConstructor } from './upgradable-element';

const enum LWCDOMMode {
    manual = 'manual',
}

interface KeyToIndexMap {
    [key: string]: number;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function patch(n1: VNode | null, n2: VNode, parent: ParentNode, anchor: Node | null) {
    if (n1 === n2) {
        return;
    }

    // FIXME: When does this occurs, is it possible with LWC?
    if (!isNull(n1) && !sameVnode(n1, n2)) {
        anchor = n2.owner.renderer.nextSibling(n1.elm);
        unmount(n1, parent);
        n1 = null;
    }

    switch (n2.type) {
        case VNodeType.Text:
            processText(n1 as VText, n2, parent, anchor);
            break;

        case VNodeType.Comment:
            processComment(n1 as VComment, n2, parent, anchor);
            break;

        case VNodeType.Element:
            processElement(n1 as VElement, n2, parent, anchor);
            break;

        case VNodeType.CustomElement:
            processCustomElement(n1 as VCustomElement, n2, parent, anchor);
            break;
    }
}

function processText(n1: VText, n2: VText, parent: ParentNode, anchor: Node | null) {
    const { owner } = n2;
    const { renderer } = owner;

    if (isNull(n1)) {
        const textNode = (n2.elm = renderer.createText(n2.text));
        linkNodeToShadow(textNode, owner);

        insertNodeHook(n2, parent, anchor);
    } else {
        n2.elm = n1.elm;

        // FIXME: We shouldn't need compare the node content in `updateNodeHook`.
        if (n2.text !== n1.text) {
            updateNodeHook(n1, n2);
        }
    }
}

function processComment(n1: VComment, n2: VComment, parent: ParentNode, anchor: Node | null) {
    const { owner } = n2;
    const { renderer } = owner;

    if (isNull(n1)) {
        const textNode = (n2.elm = renderer.createComment(n2.text));
        linkNodeToShadow(textNode, owner);

        insertNodeHook(n2, parent, anchor);
    } else {
        // No need to patch the comment text, as it is static.
        n2.elm = n1.elm;
    }
}

function processElement(n1: VElement, n2: VElement, parent: ParentNode, anchor: Node | null) {
    if (isNull(n1)) {
        mountElement(n2, parent, anchor);
    } else {
        patchElement(n1, n2);
    }
}

function mountElement(vnode: VElement, parent: ParentNode, anchor: Node | null) {
    const {
        sel,
        owner,
        data: { svg },
    } = vnode;
    const { renderer } = owner;

    const namespace = isTrue(svg) ? SVG_NAMESPACE : undefined;
    const elm = (vnode.elm = renderer.createElement(sel, namespace));
    linkNodeToShadow(elm, owner);

    fallbackElmHook(elm, vnode);
    patchElementAttrsAndProps(null, vnode);

    insertNodeHook(vnode, parent, anchor);

    mountChildren(vnode.children, elm);
}

function patchElement(n1: VElement, n2: VElement) {
    const elm = (n2.elm = n1.elm!);

    patchElementAttrsAndProps(n1, n2);
    patchChildren(elm, n1.children, n2.children);
}

function processCustomElement(
    n1: VCustomElement,
    n2: VCustomElement,
    parent: ParentNode,
    anchor: Node | null
) {
    if (isNull(n1)) {
        mountCustomElement(n2, parent, anchor);
    } else {
        patchCustomElement(n1, n2);
    }
}

function mountCustomElement(vnode: VCustomElement, parent: ParentNode, anchor: Node | null) {
    const { sel, owner } = vnode;
    const { renderer } = owner;

    const UpgradableConstructor = getUpgradableConstructor(sel, renderer);
    /**
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */
    const elm = (vnode.elm = new UpgradableConstructor((elm: HTMLElement) => {
        // the custom element from the registry is expecting an upgrade callback
        createViewModelHook(elm, vnode);
    }));
    linkNodeToShadow(elm, owner);

    const vm = getAssociatedVMIfPresent(elm);

    if (!isUndefined(vm)) {
        allocateChildrenHook(vnode, vm);
    } else if (vnode.ctor !== UpgradableConstructor) {
        throw new TypeError(`Incorrect Component Constructor`);
    }

    patchElementAttrsAndProps(null, vnode);

    insertNodeHook(vnode, parent, anchor);

    if (!isUndefined(vm)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
        }
        runConnectedCallback(vm);
    }

    mountChildren(vnode.children, elm);

    if (vm) {
        appendVM(vm);
    }
}

function patchCustomElement(n1: VCustomElement, n2: VCustomElement) {
    const elm = (n2.elm = n1.elm!);
    const vm = getAssociatedVMIfPresent(elm);

    patchElementAttrsAndProps(n1, n2);

    if (!isUndefined(vm)) {
        // in fallback mode, the allocation will always set children to
        // empty and delegate the real allocation to the slot elements
        allocateChildrenHook(n2, vm);
    }

    // in fallback mode, the children will be always empty, so, nothing
    // will happen, but in native, it does allocate the light dom
    patchChildren(elm, n1.children, n1.children);

    if (!isUndefined(vm)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(
                isArray(n2.children),
                `Invalid vnode for a custom element, it must have children defined.`
            );
        }
        // this will probably update the shadowRoot, but only if the vm is in a dirty state
        // this is important to preserve the top to bottom synchronous rendering phase.
        rerenderVM(vm);
    }
}

function unmount(vnode: VNode, parent: ParentNode) {
    removeNodeHook(vnode, parent);

    switch (vnode.type) {
        case VNodeType.Element:
            unmountChildren(vnode.children, vnode.elm!);
            break;

        case VNodeType.CustomElement: {
            const vm = getAssociatedVMIfPresent(vnode.elm);

            // No need to unmount the children here, `removeVM` will take care of removing the
            // children.
            if (!isUndefined(vm)) {
                removeVM(vm);
            }
        }
    }
}

function unmountChildren(children: VNodes, parent: ParentNode) {
    for (let i = 0; i < children.length; ++i) {
        const child = children[i];

        if (child != null) {
            unmount(child, parent);
        }
    }
}

// export const TextHook: Hooks<VText> = {
//     create: (vnode) => {
//         const { owner } = vnode;
//         const { renderer } = owner;

//         const elm = renderer.createText(vnode.text!);
//         linkNodeToShadow(elm, owner);
//         vnode.elm = elm;
//     },
//     update: updateNodeHook,
//     insert: insertNodeHook,
//     move: insertNodeHook, // same as insert for text nodes
//     remove: removeNodeHook,
//     hydrate: (vNode: VNode, node: Node) => {
//         if (process.env.NODE_ENV !== 'production') {
//             // eslint-disable-next-line lwc-internal/no-global-node
//             if (node.nodeType !== Node.TEXT_NODE) {
//                 logError('Hydration mismatch: incorrect node type received', vNode.owner);
//                 assert.fail('Hydration mismatch: incorrect node type received.');
//             }

//             if (node.nodeValue !== vNode.text) {
//                 logWarn(
//                     'Hydration mismatch: text values do not match, will recover from the difference',
//                     vNode.owner
//                 );
//             }
//         }

//         // always set the text value to the one from the vnode.
//         node.nodeValue = vNode.text ?? null;
//         vNode.elm = node;
//     },
// };

// export const CommentHook: Hooks<VComment> = {
//     create: (vnode) => {
//         const { owner, text } = vnode;
//         const { renderer } = owner;

//         const elm = renderer.createComment(text);
//         linkNodeToShadow(elm, owner);
//         vnode.elm = elm;
//     },
//     update: updateNodeHook,
//     insert: insertNodeHook,
//     move: insertNodeHook, // same as insert for text nodes
//     remove: removeNodeHook,
//     hydrate: (vNode: VNode, node: Node) => {
//         if (process.env.NODE_ENV !== 'production') {
//             // eslint-disable-next-line lwc-internal/no-global-node
//             if (node.nodeType !== Node.COMMENT_NODE) {
//                 logError('Hydration mismatch: incorrect node type received', vNode.owner);
//                 assert.fail('Hydration mismatch: incorrect node type received.');
//             }

//             if (node.nodeValue !== vNode.text) {
//                 logWarn(
//                     'Hydration mismatch: comment values do not match, will recover from the difference',
//                     vNode.owner
//                 );
//             }
//         }

//         // always set the text value to the one from the vnode.
//         node.nodeValue = vNode.text ?? null;
//         vNode.elm = node;
//     },
// };

// // insert is called after update, which is used somewhere else (via a module)
// // to mark the vm as inserted, that means we cannot use update as the main channel
// // to rehydrate when dirty, because sometimes the element is not inserted just yet,
// // which breaks some invariants. For that reason, we have the following for any
// // Custom Element that is inserted via a template.
// export const ElementHook: Hooks<VElement> = {
//     create: (vnode) => {
//         const {
//             sel,
//             owner,
//             data: { svg },
//         } = vnode;
//         const { renderer } = owner;

//         const namespace = isTrue(svg) ? SVG_NAMESPACE : undefined;
//         const elm = renderer.createElement(sel, namespace);

//         linkNodeToShadow(elm, owner);
//         fallbackElmHook(elm, vnode);
//         vnode.elm = elm;

//         patchElementAttrsAndProps(null, vnode);
//     },
//     update: (oldVnode, vnode) => {
//         patchElementAttrsAndProps(oldVnode, vnode);
//         patchChildren(vnode.elm!, oldVnode.children, vnode.children);
//     },
//     insert: (vnode, parentNode, referenceNode) => {
//         insertNodeHook(vnode, parentNode, referenceNode);
//         mountChildren(vnode);
//     },
//     move: (vnode, parentNode, referenceNode) => {
//         insertNodeHook(vnode, parentNode, referenceNode);
//     },
//     remove: (vnode, parentNode) => {
//         removeNodeHook(vnode, parentNode);
//         removeElmHook(vnode);
//     },
//     hydrate: (vnode, node) => {
//         const elm = node as Element;
//         vnode.elm = elm;

//         const { context } = vnode.data;
//         const isDomManual = Boolean(
//             !isUndefined(context) &&
//                 !isUndefined(context.lwc) &&
//                 context.lwc.dom === LWCDOMMode.manual
//         );

//         if (isDomManual) {
//             // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
//             // remove the innerHTML from props so it reuses the existing dom elements.
//             const { props } = vnode.data;
//             if (!isUndefined(props) && !isUndefined(props.innerHTML)) {
//                 if (elm.innerHTML === props.innerHTML) {
//                     delete props.innerHTML;
//                 } else {
//                     logWarn(
//                         `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: innerHTML values do not match for element, will recover from the difference`,
//                         vnode.owner
//                     );
//                 }
//             }
//         }

//         hydrateElmHook(vnode);

//         if (!isDomManual) {
//             hydrateChildrenHook(vnode.elm.childNodes, vnode.children, vnode.owner);
//         }
//     },
// };

// export const CustomElementHook: Hooks<VCustomElement> = {
//     create: (vnode) => {
//         const { sel, owner } = vnode;
//         const { renderer } = owner;
//         const UpgradableConstructor = getUpgradableConstructor(sel, renderer);
//         /**
//          * Note: if the upgradable constructor does not expect, or throw when we new it
//          * with a callback as the first argument, we could implement a more advanced
//          * mechanism that only passes that argument if the constructor is known to be
//          * an upgradable custom element.
//          */
//         const elm = new UpgradableConstructor((elm: HTMLElement) => {
//             // the custom element from the registry is expecting an upgrade callback
//             createViewModelHook(elm, vnode);
//         });

//         linkNodeToShadow(elm, owner);
//         vnode.elm = elm;

//         const vm = getAssociatedVMIfPresent(elm);
//         if (vm) {
//             allocateChildrenHook(vnode, vm);
//         } else if (vnode.ctor !== UpgradableConstructor) {
//             throw new TypeError(`Incorrect Component Constructor`);
//         }
//         patchElementAttrsAndProps(null, vnode);
//     },
//     update: (oldVnode, vnode) => {
//         patchElementAttrsAndProps(oldVnode, vnode);
//         const vm = getAssociatedVMIfPresent(vnode.elm);
//         if (vm) {
//             // in fallback mode, the allocation will always set children to
//             // empty and delegate the real allocation to the slot elements
//             allocateChildrenHook(vnode, vm);
//         }
//         // in fallback mode, the children will be always empty, so, nothing
//         // will happen, but in native, it does allocate the light dom
//         patchChildren(vnode.elm!, oldVnode.children, vnode.children);
//         if (vm) {
//             if (process.env.NODE_ENV !== 'production') {
//                 assert.isTrue(
//                     isArray(vnode.children),
//                     `Invalid vnode for a custom element, it must have children defined.`
//                 );
//             }
//             // this will probably update the shadowRoot, but only if the vm is in a dirty state
//             // this is important to preserve the top to bottom synchronous rendering phase.
//             rerenderVM(vm);
//         }
//     },
//     insert: (vnode, parentNode, referenceNode) => {
//         insertNodeHook(vnode, parentNode, referenceNode);
//         const vm = getAssociatedVMIfPresent(vnode.elm);
//         if (vm) {
//             if (process.env.NODE_ENV !== 'production') {
//                 assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
//             }
//             runConnectedCallback(vm);
//         }
//         mountChildren(vnode);
//         if (vm) {
//             appendVM(vm);
//         }
//     },
//     move: (vnode, parentNode, referenceNode) => {
//         insertNodeHook(vnode, parentNode, referenceNode);
//     },
//     remove: (vnode, parentNode) => {
//         removeNodeHook(vnode, parentNode);
//         const vm = getAssociatedVMIfPresent(vnode.elm);
//         if (vm) {
//             // for custom elements we don't have to go recursively because the removeVM routine
//             // will take care of disconnecting any child VM attached to its shadow as well.
//             removeVM(vm);
//         }
//     },
//     hydrate: (vnode, elm) => {
//         // the element is created, but the vm is not
//         const { sel, mode, ctor, owner } = vnode;

//         const def = getComponentInternalDef(ctor);
//         createVM(elm, def, {
//             mode,
//             owner,
//             tagName: sel,
//             renderer: owner.renderer,
//         });

//         vnode.elm = elm as Element;

//         const vm = getAssociatedVM(elm);
//         allocateChildrenHook(vnode, vm);

//         hydrateElmHook(vnode);

//         // Insert hook section:
//         if (process.env.NODE_ENV !== 'production') {
//             assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
//         }
//         runConnectedCallback(vm);

//         if (vm.renderMode !== RenderMode.Light) {
//             // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
//             // Note: for Light DOM, this is handled while hydrating the VM
//             hydrateChildrenHook(vnode.elm.childNodes, vnode.children, vm);
//         }

//         hydrateVM(vm);
//     },
// };

function linkNodeToShadow(elm: Node, owner: VM) {
    const { renderer, renderMode, shadowMode } = owner;

    // TODO [#1164]: this should eventually be done by the polyfill directly
    if (renderer.isSyntheticShadowDefined) {
        if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
            (elm as any)[KEY__SHADOW_RESOLVER] = getRenderRoot(owner)[KEY__SHADOW_RESOLVER];
        }
    }
}

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

function updateNodeHook(oldVnode: VNode, vnode: VNode) {
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

function insertNodeHook(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    const { renderer } = vnode.owner;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.insert(vnode.elm!, parentNode, referenceNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function removeNodeHook(vnode: VNode, parentNode: Node) {
    const { renderer } = vnode.owner;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.remove(vnode.elm!, parentNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function patchElementAttrsAndProps(oldVnode: VBaseElement | null, vnode: VBaseElement) {
    if (isNull(oldVnode)) {
        applyEventListeners(vnode);
        applyStaticClassAttribute(vnode);
        applyStaticStyleAttribute(vnode);
    }

    // Attrs need to be applied to element before props IE11 will wipe out value on radio inputs if
    // value is set before type=radio.
    patchAttributes(oldVnode, vnode);
    patchProps(oldVnode, vnode);
    patchClassAttribute(oldVnode, vnode);
    patchStyleAttribute(oldVnode, vnode);
}

// function hydrateElmHook(vnode: VBaseElement) {
//     applyEventListeners(vnode);
//     // Attrs are already on the element.
//     // modAttrs.create(vnode);
//     patchProps(null, vnode);
//     // Already set.
//     // applyStaticClassAttribute(vnode);
//     // applyStaticStyleAttribute(vnode);
//     // modComputedClassName.create(vnode);
//     // modComputedStyle.create(vnode);
// }

function fallbackElmHook(elm: Element, vnode: VElement) {
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

function allocateChildrenHook(vnode: VCustomElement, vm: VM) {
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

function createViewModelHook(elm: HTMLElement, vnode: VCustomElement) {
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

function mountChildren(children: VNodes, parent: Element) {
    for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (child != null) {
            patch(null, child, parent, null);
            // ch.hook.create(ch);
            // ch.hook.insert(ch, elm!, null);
        }
    }
}

// function isElementNode(node: ChildNode): node is Element {
//     // eslint-disable-next-line lwc-internal/no-global-node
//     return node.nodeType === Node.ELEMENT_NODE;
// }

// function vnodesAndElementHaveCompatibleAttrs(vnode: VNode, elm: Element): boolean {
//     const {
//         data: { attrs = {} },
//         owner: { renderer },
//     } = vnode;

//     let nodesAreCompatible = true;

//     // Validate attributes, though we could always recovery from those by running the update mods.
//     // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
//     for (const [attrName, attrValue] of Object.entries(attrs)) {
//         const elmAttrValue = renderer.getAttribute(elm, attrName);
//         if (String(attrValue) !== elmAttrValue) {
//             logError(
//                 `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: attribute "${attrName}" has different values, expected "${attrValue}" but found "${elmAttrValue}"`,
//                 vnode.owner
//             );
//             nodesAreCompatible = false;
//         }
//     }

//     return nodesAreCompatible;
// }

// function vnodesAndElementHaveCompatibleClass(vnode: VNode, elm: Element): boolean {
//     const {
//         data: { className, classMap },
//         owner: { renderer },
//     } = vnode;

//     let nodesAreCompatible = true;
//     let vnodeClassName;

//     if (!isUndefined(className) && String(className) !== elm.className) {
//         // className is used when class is bound to an expr.
//         nodesAreCompatible = false;
//         vnodeClassName = className;
//     } else if (!isUndefined(classMap)) {
//         // classMap is used when class is set to static value.
//         const classList = renderer.getClassList(elm);
//         let computedClassName = '';

//         // all classes from the vnode should be in the element.classList
//         for (const name in classMap) {
//             computedClassName += ' ' + name;
//             if (!classList.contains(name)) {
//                 nodesAreCompatible = false;
//             }
//         }

//         vnodeClassName = computedClassName.trim();

//         if (classList.length > keys(classMap).length) {
//             nodesAreCompatible = false;
//         }
//     }

//     if (!nodesAreCompatible) {
//         logError(
//             `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: attribute "class" has different values, expected "${vnodeClassName}" but found "${
//                 elm.className
//             }"`,
//             vnode.owner
//         );
//     }

//     return nodesAreCompatible;
// }

// function vnodesAndElementHaveCompatibleStyle(vnode: VNode, elm: Element): boolean {
//     const {
//         data: { style, styleDecls },
//         owner: { renderer },
//     } = vnode;
//     const elmStyle = renderer.getAttribute(elm, 'style') || '';
//     let vnodeStyle;
//     let nodesAreCompatible = true;

//     if (!isUndefined(style) && style !== elmStyle) {
//         nodesAreCompatible = false;
//         vnodeStyle = style;
//     } else if (!isUndefined(styleDecls)) {
//         const parsedVnodeStyle = parseStyleText(elmStyle);
//         const expectedStyle = [];
//         // styleMap is used when style is set to static value.
//         for (let i = 0, n = styleDecls.length; i < n; i++) {
//             const [prop, value, important] = styleDecls[i];
//             expectedStyle.push(`${prop}: ${value + (important ? ' important!' : '')}`);

//             const parsedPropValue = parsedVnodeStyle[prop];

//             if (isUndefined(parsedPropValue)) {
//                 nodesAreCompatible = false;
//             } else if (!parsedPropValue.startsWith(value)) {
//                 nodesAreCompatible = false;
//             } else if (important && !parsedPropValue.endsWith('!important')) {
//                 nodesAreCompatible = false;
//             }
//         }

//         if (keys(parsedVnodeStyle).length > styleDecls.length) {
//             nodesAreCompatible = false;
//         }

//         vnodeStyle = ArrayJoin.call(expectedStyle, ';');
//     }

//     if (!nodesAreCompatible) {
//         // style is used when class is bound to an expr.
//         logError(
//             `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: attribute "style" has different values, expected "${vnodeStyle}" but found "${elmStyle}".`,
//             vnode.owner
//         );
//     }

//     return nodesAreCompatible;
// }

// function throwHydrationError() {
//     assert.fail('Server rendered elements do not match client side generated elements');
// }

export function hydrateChildrenHook(
    _elmChildren: NodeListOf<ChildNode>,
    _children: VNodes,
    _vm?: VM
) {
    // if (process.env.NODE_ENV !== 'production') {
    //     const filteredVNodes = ArrayFilter.call(children, (vnode) => !!vnode);
    //     if (elmChildren.length !== filteredVNodes.length) {
    //         logError(
    //             `Hydration mismatch: incorrect number of rendered nodes, expected ${filteredVNodes.length} but found ${elmChildren.length}.`,
    //             vm
    //         );
    //         throwHydrationError();
    //     }
    // }
    // let elmCurrentChildIdx = 0;
    // for (let j = 0, n = children.length; j < n; j++) {
    //     const ch = children[j];
    //     if (ch != null) {
    //         const childNode = elmChildren[elmCurrentChildIdx];
    //         if (process.env.NODE_ENV !== 'production') {
    //             // VComments and VTexts validation is handled in their hooks
    //             if (isElementNode(childNode)) {
    //                 if (ch.sel?.toLowerCase() !== childNode.tagName.toLowerCase()) {
    //                     logError(
    //                         `Hydration mismatch: expecting element with tag "${ch.sel?.toLowerCase()}" but found "${childNode.tagName.toLowerCase()}".`,
    //                         vm
    //                     );
    //                     throwHydrationError();
    //                 }
    //                 // Note: props are not yet set
    //                 const hasIncompatibleAttrs = vnodesAndElementHaveCompatibleAttrs(ch, childNode);
    //                 const hasIncompatibleClass = vnodesAndElementHaveCompatibleClass(ch, childNode);
    //                 const hasIncompatibleStyle = vnodesAndElementHaveCompatibleStyle(ch, childNode);
    //                 const isVNodeAndElementCompatible =
    //                     hasIncompatibleAttrs && hasIncompatibleClass && hasIncompatibleStyle;
    //                 if (!isVNodeAndElementCompatible) {
    //                     throwHydrationError();
    //                 }
    //             }
    //         }
    //         ch.hook.hydrate(ch, childNode);
    //         elmCurrentChildIdx++;
    //     }
    // }
}

// function removeElmHook(vnode: VElement) {
//     // this method only needs to search on child vnodes from template
//     // to trigger the remove hook just in case some of those children
//     // are custom elements.
//     const { children, elm } = vnode;
//     for (let j = 0, len = children.length; j < len; ++j) {
//         const ch = children[j];
//         if (!isNull(ch)) {
//             ch.hook.remove(ch, elm!);
//         }
//     }
// }

function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function isVNode(vnode: any): vnode is VNode {
    return vnode != null;
}

function createKeyToOldIdx(children: VNodes, beginIdx: number, endIdx: number): KeyToIndexMap {
    const map: KeyToIndexMap = {};
    let j: number, key: Key | undefined, ch;
    // TODO [#1637]: simplify this by assuming that all vnodes has keys
    for (j = beginIdx; j <= endIdx; ++j) {
        ch = children[j];
        if (isVNode(ch)) {
            key = ch.key;
            if (key !== undefined) {
                map[key] = j;
            }
        }
    }
    return map;
}

function addVnodes(
    parentElm: ParentNode,
    before: Node | null,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number
) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (isVNode(ch)) {
            patch(null, ch, parentElm, before);
            // ch.hook.create(ch);
            // ch.hook.insert(ch, parentElm, before);
        }
    }
}

function removeVnodes(
    parentElm: ParentNode,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number
): void {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        // text nodes do not have logic associated to them
        if (isVNode(ch)) {
            unmount(ch, parentElm);
            // ch.hook.remove(ch, parentElm);
        }
    }
}

function updateDynamicChildren(parentElm: ParentNode, oldCh: VNodes, newCh: VNodes) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    const newChEnd = newCh.length - 1;
    let newEndIdx = newChEnd;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx: any;
    let idxInOld: number;
    let elmToMove: VNode | null | undefined;
    let before: any;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!isVNode(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
        } else if (!isVNode(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndIdx];
        } else if (!isVNode(newStartVnode)) {
            newStartVnode = newCh[++newStartIdx];
        } else if (!isVNode(newEndVnode)) {
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode, parentElm, null);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode, parentElm, null);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patch(oldStartVnode, newEndVnode, parentElm, null);
            insertNodeHook(
                oldStartVnode,
                parentElm,
                oldEndVnode.owner.renderer.nextSibling(oldEndVnode.elm!)
            );
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patch(oldEndVnode, newStartVnode, parentElm, null);
            insertNodeHook(oldEndVnode, parentElm, oldStartVnode.elm!);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            }
            idxInOld = oldKeyToIdx[newStartVnode.key!];
            if (isUndefined(idxInOld)) {
                // New element
                patch(null, newStartVnode, parentElm, oldStartVnode.elm!);
                newStartVnode = newCh[++newStartIdx];
            } else {
                elmToMove = oldCh[idxInOld];
                if (isVNode(elmToMove)) {
                    if (elmToMove.sel !== newStartVnode.sel) {
                        // New element
                        patch(null, newStartVnode, parentElm, oldStartVnode.elm!);
                    } else {
                        patch(elmToMove, newStartVnode, parentElm, null);
                        oldCh[idxInOld] = undefined as any;
                        insertNodeHook(elmToMove, parentElm, oldStartVnode.elm!);
                    }
                }
                newStartVnode = newCh[++newStartIdx];
            }
        }
    }
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
        if (oldStartIdx > oldEndIdx) {
            // There's some cases in which the sub array of vnodes to be inserted is followed by null(s) and an
            // already processed vnode, in such cases the vnodes to be inserted should be before that processed vnode.
            let i = newEndIdx;
            let n;
            do {
                n = newCh[++i];
            } while (!isVNode(n) && i < newChEnd);
            before = isVNode(n) ? n.elm : null;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
        } else {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
}

function updateStaticChildren(parentElm: ParentNode, oldCh: VNodes, newCh: VNodes) {
    const oldChLength = oldCh.length;
    const newChLength = newCh.length;

    if (oldChLength === 0) {
        // the old list is empty, we can directly insert anything new
        addVnodes(parentElm, null, newCh, 0, newChLength);
        return;
    }
    if (newChLength === 0) {
        // the old list is nonempty and the new list is empty so we can directly remove all old nodes
        // this is the case in which the dynamic children of an if-directive should be removed
        removeVnodes(parentElm, oldCh, 0, oldChLength);
        return;
    }
    // if the old list is not empty, the new list MUST have the same
    // amount of nodes, that's why we call this static children
    let referenceElm: Node | null = null;
    for (let i = newChLength - 1; i >= 0; i -= 1) {
        const vnode = newCh[i];
        const oldVNode = oldCh[i];
        if (vnode !== oldVNode) {
            if (isVNode(oldVNode)) {
                if (isVNode(vnode)) {
                    // both vnodes must be equivalent, and se just need to patch them
                    patch(oldVNode, vnode, parentElm, null);
                    referenceElm = vnode.elm!;
                } else {
                    // removing the old vnode since the new one is null
                    unmount(oldVNode, parentElm);
                }
            } else if (isVNode(vnode)) {
                // this condition is unnecessary
                // insert the new node one since the old one is nul
                patch(null, vnode, parentElm, referenceElm);
                referenceElm = vnode.elm!;
            }
        }
    }
}

export function patchChildren(parentElm: ParentNode, oldCh: VNodes, newCh: VNodes): void {
    if (hasDynamicChildren(newCh)) {
        updateDynamicChildren(parentElm, oldCh, newCh);
    } else {
        updateStaticChildren(parentElm, oldCh, newCh);
    }
}

// function patchVnode(oldVnode: VNode, vnode: VNode) {
//     if (oldVnode !== vnode) {
//         vnode.elm = oldVnode.elm;
//         vnode.hook.update(oldVnode, vnode);
//     }
// }

// slow path routine
// NOTE: we should probably more this routine to the synthetic shadow folder
// and get the allocation to be cached by in the elm instead of in the VM
function allocateInSlot(vm: VM, children: VNodes) {
    const { cmpSlots: oldSlots } = vm;
    const cmpSlots = (vm.cmpSlots = create(null));
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }
        const { data } = vnode;
        const slotName = (data.attrs?.slot ?? '') as string;
        const vnodes = (cmpSlots[slotName] = cmpSlots[slotName] || []);
        // re-keying the vnodes is necessary to avoid conflicts with default content for the slot
        // which might have similar keys. Each vnode will always have a key that
        // starts with a numeric character from compiler. In this case, we add a unique
        // notation for slotted vnodes keys, e.g.: `@foo:1:1`
        if (!isUndefined(vnode.key)) {
            vnode.key = `@${slotName}:${vnode.key}`;
        }
        ArrayPush.call(vnodes, vnode);
    }
    if (!vm.isDirty) {
        // We need to determine if the old allocation is really different from the new one
        // and mark the vm as dirty
        const oldKeys = keys(oldSlots);
        if (oldKeys.length !== keys(cmpSlots).length) {
            markComponentAsDirty(vm);
            return;
        }
        for (let i = 0, len = oldKeys.length; i < len; i += 1) {
            const key = oldKeys[i];
            if (isUndefined(cmpSlots[key]) || oldSlots[key].length !== cmpSlots[key].length) {
                markComponentAsDirty(vm);
                return;
            }
            const oldVNodes = oldSlots[key];
            const vnodes = cmpSlots[key];
            for (let j = 0, a = cmpSlots[key].length; j < a; j += 1) {
                if (oldVNodes[j] !== vnodes[j]) {
                    markComponentAsDirty(vm);
                    return;
                }
            }
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

function hasDynamicChildren(children: VNodes): boolean {
    return FromIteration.has(children);
}
