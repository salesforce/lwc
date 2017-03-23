import {
    currentContext,
    establishContext,
} from "./context.js";
import * as api from "./api.js";
import assert from "./assert.js";
import { isArray, create, slice } from "./language.js";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

const EmptySlots = create(null);

function wrapDOMNode(element: Node): VNode {
    // TODO: generalize this to support all kind of Nodes
    // TODO: instead of creating the h() directly, use toVNode() or something else from snabbdom
    // TODO: the element could be derivated from another raptor component, in which case we should
    // use the corresponding vnode instead
    assert.isTrue(element instanceof HTMLElement, "Only HTMLElements can be wrapped by h()");
    const tagName = element.tagName.toLowerCase();
    const vnode = api.h(tagName, {});
    vnode.elm = element;
    return vnode;
}

function normalizeRenderResult(vm: VM, elementOrVnodeOrArrayOfVnodes: any): Array<VNode> {
    if (!elementOrVnodeOrArrayOfVnodes) {
        return [];
    }
    // never mutate the original array
    const vnodes = isArray(elementOrVnodeOrArrayOfVnodes) ? slice.call(elementOrVnodeOrArrayOfVnodes, 0) : [elementOrVnodeOrArrayOfVnodes];
    for (let i = 0; i < vnodes.length; i += 1) {
        const elm = vnodes[i];
        // TODO: we can improve this detection mechanism
        if (elm && (elm.sel || elm.text)) {
            // this is usually the default behavior, we wire this up for that reason.
            assert.vnode(elm, `Invalid element ${vnodes[i]} returned in ${i + 1} position when calling ${vm}.render().`);
        } else if (elm instanceof Node) {
            vnodes[i] = wrapDOMNode(elm);
        } else {
            // supporting text nodes
            vnodes[i] = { text: (elm === null || elm === undefined) ? '' : elm + '' };
        }
    }
    return vnodes;
}

export function invokeComponentConstructor(vm: VM, Ctor: Class<Component>): Component {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const component = new Ctor();
    establishContext(ctx);
    return component;
}

export function invokeComponentDisconnectedCallback(vm: VM) {
    const { component, context } = vm;
    if (component.disconnectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentConnectedCallback(vm: VM) {
    const { component, context } = vm;
    if (component.connectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.connectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentRenderedCallback(vm: VM) {
    const { component, context } = vm;
    if (component.renderedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.renderedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: VM): Array<VNode> {
    const { component, context, cmpSlots = EmptySlots } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(context);
        const isRenderingInception = isRendering;
        const vmBeingRenderedInception = vmBeingRendered;
        isRendering = true;
        vmBeingRendered = vm;
        let result = component.render();
        // when the render method `return html;`, the factory has to be invoked
        // TODO: add identity to the html functions
        if (typeof result === 'function') {
            assert.block(() => {
                // TODO: validate that the slots provided via cmpSlots are allowed, this
                // will require the compiler to provide the list of allowed slots via metadata.
                // TODO: validate that the template properties provided via metadata are
                // defined properties of this component.
            });
            // TODO: cmpSlots should be a proxy to it so we can monitor what slot names are
            // accessed during the rendering method, so we can optimize the dirty checks for
            // changes in slots.
            result = result.call(undefined, api, component, cmpSlots);
        }
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
        establishContext(ctx);
        // the render method can return many different things, here we attempt to normalize it.
        return normalizeRenderResult(vm, result);
    }
    return [];
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { component, context } = vm;
    if (component.attributeChangedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}
