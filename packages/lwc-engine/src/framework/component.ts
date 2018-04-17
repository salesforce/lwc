import assert from "./assert";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
    isRendering,
    vmBeingRendered,
} from "./invoker";
import { isArray, ArrayIndexOf, ArraySplice } from "./language";
import { invokeServiceHook, Services } from "./services";
import { getComponentDef, PropsDef, WireHash, TrackDef, ViewModelReflection } from './def';
import { VM } from "./vm";
import { VNodes } from "../3rdparty/snabbdom/types";

import { Template } from "./template";
import { ShadowRoot, isChildNode } from "./root";
import { getRootNode } from "./dom";
export type ErrorCallback = (error: any, stack: string) => void;
export interface Component {
    [ViewModelReflection]: VM;
    readonly classList: DOMTokenList;
    readonly root: ShadowRoot;
    render?: () => void | Template;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    errorCallback?: ErrorCallback;
    [key: string]: any;
}

// TODO: review this with the compiler output
export interface ComponentConstructor {
    new (): Component;
    readonly name: string;
    readonly forceTagName?: keyof HTMLElementTagNameMap;
    readonly publicMethods?: string[];
    readonly publicProps?: PropsDef;
    readonly track?: TrackDef;
    readonly wire?: WireHash;
    readonly labels?: string[];
    readonly templateUsedProps?: string[];
    // support for circular
    <T>(): T;
    readonly __circular__?: any;
}

export let vmBeingConstructed: VM | null = null;
export function isBeingConstructed(vm: VM): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    return vmBeingConstructed === vm;
}

export function createComponent(vm: VM, Ctor: ComponentConstructor) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // create the component instance
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;

    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.component === component, `Invalid construction for ${vm}, maybe you are missing the call to super() on classes extending Element.`);
        const { track } = getComponentDef(Ctor);
        if ('state' in component && (!track || !track.state)) {
            assert.logWarning(`Non-trackable component state detected in ${component}. Updates to state property will not be reactive. To make state reactive, add @track decorator.`);
        }
    }
}

export function linkComponent(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // wiring service
    const { def: { wire } } = vm;
    if (wire) {
        const { wiring } = Services;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
}

export function clearReactiveListeners(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { deps } = vm;
    const len = deps.length;
    if (len) {
        for (let i = 0; i < len; i += 1) {
            const set = deps[i];
            const pos = ArrayIndexOf.call(deps[i], vm);
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(pos > -1, `when clearing up deps, the vm must be part of the collection.`);
            }
            ArraySplice.call(set, pos, 1);
        }
        deps.length = 0;
    }
}

export function isValidEvent(event: Event): boolean {
    // TODO: this is only needed if ShadowDOM is not used
    if ((event as any).composed === true) {
        return true;
    }
    // if the closest root contains the currentTarget, the event is valid
    return isChildNode(getRootNode.call(event.target), event.currentTarget as Node);
}

export function renderComponent(vm: VM): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(vm.isDirty, `${vm} is not dirty.`);
    }

    clearReactiveListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    }
    return vnodes;
}

export function markComponentAsDirty(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the component is already dirty.`);
        assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
    }
    vm.isDirty = true;
}

export function getCustomElementComponent(elmOrRoot: HTMLElement | ShadowRoot): Component {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(elmOrRoot[ViewModelReflection]);
    }
    return (elmOrRoot[ViewModelReflection] as VM).component as Component;
}
