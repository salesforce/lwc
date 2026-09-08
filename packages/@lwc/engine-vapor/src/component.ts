/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { insertBlock, removeBlock } from './block';
import { createReactiveProxy } from './reactivity';
import { batch } from './renderEffect';
import type { Block } from './block';

type LifecycleHook = (() => void)[];

export interface VaporComponentDef {
    name: string;
    render: (cmp: any, slotset?: Record<string, () => Block>) => Block;
    props?: string[];
    shadowMode?: 'open' | 'closed';
    renderMode?: 'shadow' | 'light';
}

export interface VaporComponentInstance {
    uid: number;
    def: VaporComponentDef;
    cmp: any;
    block: Block | null;
    el: HTMLElement;
    shadowRoot: ShadowRoot | null;
    isMounted: boolean;
    isConnected: boolean;
    props: Record<string, any>;
    slotset: Record<string, () => Block>;
    // Lifecycle hooks
    bm?: LifecycleHook; // beforeMount
    m?: LifecycleHook; // mounted
    bu?: LifecycleHook; // beforeUpdate
    u?: LifecycleHook; // updated
    dc?: LifecycleHook; // disconnected
    cleanups: (() => void)[];
}

let uid = 0;
let currentInstance: VaporComponentInstance | null = null;

export function getCurrentInstance(): VaporComponentInstance | null {
    return currentInstance;
}

export function setCurrentInstance(
    instance: VaporComponentInstance | null
): VaporComponentInstance | null {
    const prev = currentInstance;
    currentInstance = instance;
    return prev;
}

export function createVaporComponent(
    el: HTMLElement,
    def: VaporComponentDef,
    props: Record<string, any> = {},
    slotset: Record<string, () => Block> = {}
): VaporComponentInstance {
    const instance: VaporComponentInstance = {
        uid: uid++,
        def,
        cmp: null,
        block: null,
        el,
        shadowRoot: null,
        isMounted: false,
        isConnected: false,
        props: createReactiveProxy({ ...props }),
        slotset,
        cleanups: [],
    };

    // Attach shadow DOM if configured
    if (def.renderMode !== 'light') {
        instance.shadowRoot = el.attachShadow({
            mode: def.shadowMode || 'open',
        });
    }

    // Create component proxy (mimics LightningElement behavior)
    instance.cmp = createComponentProxy(instance);

    // Execute render in instance context
    const prev = setCurrentInstance(instance);
    try {
        instance.block = def.render(instance.cmp, instance.slotset);
    } finally {
        setCurrentInstance(prev);
    }

    return instance;
}

export function mountComponent(instance: VaporComponentInstance): void {
    if (instance.isMounted) return;

    // beforeMount hooks
    if (instance.bm) {
        for (const fn of instance.bm) fn();
    }

    const container = instance.shadowRoot || instance.el;
    if (instance.block) {
        insertBlock(instance.block, container);
    }

    instance.isMounted = true;
    instance.isConnected = true;

    // mounted hooks (async, like in LWC connectedCallback)
    if (instance.m) {
        queueMicrotask(() => {
            for (const fn of instance.m!) fn();
        });
    }
}

export function unmountComponent(instance: VaporComponentInstance): void {
    if (!instance.isMounted) return;

    // disconnected hooks
    if (instance.dc) {
        for (const fn of instance.dc) fn();
    }

    // Cleanup all reactive effects
    for (const cleanup of instance.cleanups) {
        cleanup();
    }
    instance.cleanups = [];

    const container = instance.shadowRoot || instance.el;
    if (instance.block) {
        removeBlock(instance.block, container);
    }

    instance.isMounted = false;
    instance.isConnected = false;
}

export function updateComponentProps(
    instance: VaporComponentInstance,
    newProps: Record<string, any>
): void {
    batch(() => {
        for (const key of Object.keys(newProps)) {
            if (instance.props[key] !== newProps[key]) {
                instance.props[key] = newProps[key];
            }
        }
    });
}

function createComponentProxy(instance: VaporComponentInstance): any {
    return new Proxy(instance, {
        get(target, key) {
            if (typeof key === 'symbol') return undefined;
            // Props first (public API)
            if (key in target.props) {
                return target.props[key];
            }
            return undefined;
        },
        set(target, key, value) {
            if (typeof key === 'symbol') return false;
            target.props[key] = value;
            return true;
        },
    });
}
