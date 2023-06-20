/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, assert, isNull } from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';

import { RendererAPI } from './renderer';
import { cloneAndOmitKey } from './utils';
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
    VStatic,
    VFragment,
} from './vnodes';

import { patchProps } from './modules/props';
import { applyEventListeners } from './modules/events';
import { renderComponent } from './component';
import { generateCRC } from './crc';

// flag indicating if the hydration recovered from the DOM mismatch
let hasMismatch = false;
export function hydrateRoot(vm: VM) {
    hasMismatch = false;

    runConnectedCallback(vm);
    hydrateVM(vm);

    if (hasMismatch && process.env.NODE_ENV !== 'production') {
        logError('Hydration completed with errors.', vm);
    }
}

function crcIsValid(vnodes: VNodes, elm: HTMLElement) {
    const crcCSR = generateCRC(vnodes);
    const crcScriptTag = (elm.shadowRoot?.lastChild ?? elm.lastChild) as HTMLElement;
    const crcSSR = crcScriptTag?.innerHTML?.trim?.();
    if (crcCSR !== crcSSR && process.env.NODE_ENV !== 'production') {
        hasMismatch = true;
        // eslint-disable-next-line no-console
        console.log(
            `Server-rendered CRC "${crcSSR}" does not match client-rendered CRC "${crcCSR}."`
        );
    }
    return crcCSR === crcSSR;
}

function hydrateVM(vm: VM) {
    const children = renderComponent(vm);
    vm.children = children;

    if (!crcIsValid(children, vm.elm)) {
        // eslint-disable-next-line no-console
        console.log('oh no!');
    }

    const {
        renderRoot: parentNode,
        renderer: { getFirstChild },
    } = vm;
    hydrateChildren(getFirstChild(parentNode), children, parentNode, vm);
    runRenderedCallback(vm);
}

function hydrateNode(node: Node, vnode: VNode, renderer: RendererAPI): Node | null {
    let hydratedNode;
    switch (vnode.type) {
        case VNodeType.Text:
            // VText has no special capability, fallback to the owner's renderer
            hydratedNode = hydrateText(node, vnode, renderer);
            break;

        case VNodeType.Comment:
            // VComment has no special capability, fallback to the owner's renderer
            hydratedNode = hydrateComment(node, vnode, renderer);
            break;

        case VNodeType.Static:
            // VStatic are cacheable and cannot have custom renderer associated to them
            hydratedNode = hydrateStaticElement(node, vnode, renderer);
            break;

        case VNodeType.Fragment:
            // a fragment does not represent any element, therefore there is no need to use a custom renderer.
            hydratedNode = hydrateFragment(node, vnode, renderer);
            break;

        case VNodeType.Element:
            hydratedNode = hydrateElement(node, vnode, vnode.data.renderer ?? renderer);
            break;

        case VNodeType.CustomElement:
            hydratedNode = hydrateCustomElement(node, vnode, vnode.data.renderer ?? renderer);
            break;
    }
    return renderer.nextSibling(hydratedNode);
}

const NODE_VALUE_PROP = 'nodeValue';

function textNodeContentsAreEqual(node: Node, vnode: VText, renderer: RendererAPI): boolean {
    const { getProperty } = renderer;
    const nodeValue = getProperty(node, NODE_VALUE_PROP);

    if (nodeValue === vnode.text) {
        return true;
    }

    // Special case for empty text nodes – these are serialized differently on the server
    // See https://github.com/salesforce/lwc/pull/2656
    if (nodeValue === '\u200D' && vnode.text === '') {
        return true;
    }

    return false;
}

function hydrateText(node: Node, vnode: VText, renderer: RendererAPI): Node | null {
    if (process.env.NODE_ENV !== 'production') {
        if (!textNodeContentsAreEqual(node, vnode, renderer)) {
            logWarn(
                'Hydration mismatch: text values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }
    const { setText } = renderer;
    setText(node, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateComment(node: Node, vnode: VComment, renderer: RendererAPI): Node | null {
    if (process.env.NODE_ENV !== 'production') {
        const { getProperty } = renderer;
        const nodeValue = getProperty(node, NODE_VALUE_PROP);

        if (nodeValue !== vnode.text) {
            logWarn(
                'Hydration mismatch: comment values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }

    const { setProperty } = renderer;
    setProperty(node, NODE_VALUE_PROP, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateStaticElement(elm: Node, vnode: VStatic, renderer: RendererAPI): Node | null {
    vnode.elm = elm as Element;
    applyEventListeners(vnode, renderer);

    return elm;
}

function hydrateFragment(elm: Node, vnode: VFragment, renderer: RendererAPI): Node | null {
    const { children, owner } = vnode;

    hydrateChildren(elm, children, renderer.getProperty(elm, 'parentNode'), owner);

    return (vnode.elm = children[children.length - 1]!.elm as Node);
}

function hydrateElement(elm: Node, vnode: VElement, renderer: RendererAPI): Node | null {
    vnode.elm = elm as Element;

    const { owner } = vnode;
    const { context } = vnode.data;
    const isDomManual = Boolean(
        !isUndefined(context) && !isUndefined(context.lwc) && context.lwc.dom === LwcDomMode.Manual
    );

    if (isDomManual) {
        // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
        // remove the innerHTML from props so it reuses the existing dom elements.
        const {
            data: { props },
        } = vnode;
        const { getProperty } = renderer;
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

    patchElementPropsAndAttrs(vnode, renderer);

    if (!isDomManual) {
        const { getFirstChild } = renderer;
        hydrateChildren(getFirstChild(elm), vnode.children, elm as Element, owner);
    }

    return elm;
}

function hydrateCustomElement(
    elm: Node,
    vnode: VCustomElement,
    renderer: RendererAPI
): Node | null {
    const { sel, mode, ctor, owner } = vnode;

    const vm = createVM(elm, ctor, renderer, {
        mode,
        owner,
        tagName: sel,
        hydrated: true,
    });

    vnode.elm = elm as Element;
    vnode.vm = vm;

    allocateChildren(vnode, vm);

    if (!crcIsValid(vnode.children, elm as HTMLElement)) {
        return handleMismatch(elm, vnode, renderer);
    }

    patchElementPropsAndAttrs(vnode, renderer);

    // Insert hook section:
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
    }
    runConnectedCallback(vm);

    if (vm.renderMode !== RenderMode.Light) {
        const { getFirstChild } = renderer;
        // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
        // Note: for Light DOM, this is handled while hydrating the VM
        hydrateChildren(getFirstChild(elm), vnode.children, elm as Element, vm);
    }

    hydrateVM(vm);
    return elm;
}

function hydrateChildren(
    node: Node | null,
    children: VNodes,
    _parentNode: Element | ShadowRoot,
    owner: VM
) {
    let nextNode: Node | null = node;
    const { renderer } = owner;
    for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];

        if (!isNull(childVnode)) {
            if (nextNode) {
                nextNode = hydrateNode(nextNode, childVnode, renderer);
            }
        }
    }
}

function handleMismatch(node: Node, vnode: VNode, renderer: RendererAPI): Node | null {
    hasMismatch = true;
    const { getProperty } = renderer;
    const parentNode = getProperty(node, 'parentNode');
    mount(vnode, parentNode, renderer, node);
    removeNode(node, parentNode, renderer);

    return vnode.elm!;
}

function patchElementPropsAndAttrs(vnode: VBaseElement, renderer: RendererAPI) {
    applyEventListeners(vnode, renderer);
    patchProps(null, vnode, renderer);
}
