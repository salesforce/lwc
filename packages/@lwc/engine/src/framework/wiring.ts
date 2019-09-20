/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined, ArrayPush, getOwnPropertyNames, isFalse } from '@lwc/shared';
import { ComponentInterface } from './component';
import { valueMutated, ReactiveObserver } from '../libs/mutation-tracker';
import { VM, runWithBoundaryProtection } from './vm';
import { invokeComponentCallback } from './invoker';
import { dispatchEvent } from '../env/dom';

const WireMetaMap: Map<PropertyDescriptor, WireDef> = new Map();
function noop(): void {}

function createFieldDataCallback(vm: VM, name: string) {
    const { component, cmpFields } = vm;
    return (value: any) => {
        if (value !== vm.cmpFields[name]) {
            // storing the value in the underlying storage
            cmpFields[name] = value;
            if (isFalse(vm.isDirty)) {
                // perf optimization to skip this step if the track property is on a component that is already dirty
                valueMutated(component, name);
            }
        }
    };
}

function createMethodDataCallback(vm: VM, method: (data: any) => any) {
    return (value: any) => {
        // dispatching new value into the wired method
        invokeComponentCallback(vm, method, [value]);
    };
}

function createConfigWatcher(
    vm: VM,
    wireDef: WireDef,
    callbackWhenConfigIsReady: (newConfig: ConfigValue) => void
) {
    const { component } = vm;
    const { configCallback } = wireDef;
    let hasPendingConfig: boolean = false;
    // creating the reactive observer for reactive params when needed
    const ro = new ReactiveObserver(() => {
        if (hasPendingConfig === false) {
            hasPendingConfig = true;
            // collect new config in the micro-task
            Promise.resolve().then(() => {
                hasPendingConfig = false;
                // resetting current reactive params
                ro.reset();
                // dispatching a new config due to a change in the configuration
                callback();
            });
        }
    });
    const callback = () => {
        let config: ConfigValue;
        ro.observe(() => (config = configCallback(component)));
        // TODO: dev-mode validation of config based on the adapter.configSchema
        // @ts-ignore it is assigned in the observe() callback
        callbackWhenConfigIsReady(config);
    };
    return callback;
}

function createContextWatcher(
    vm: VM,
    wireDef: WireDef,
    callbackWhenContextIsReady: (newContext: ContextValue) => void
) {
    const { adapter } = wireDef;
    const adapterContextToken = getAdapterToken(adapter);
    if (isUndefined(adapterContextToken)) {
        return; // no provider found, nothing to be done
    }
    const {
        elm,
        context: { wiredConnecting, wiredDisconnecting },
    } = vm;
    // waiting for the component to be connected to formally request the context via the token
    ArrayPush.call(wiredConnecting, () => {
        // This event is responsible for connecting the host element with another
        // element in the composed path that is providing contextual data. The provider
        // must be listening for a special dom event with the name corresponding to the value of
        // `adapterContextToken`, which will remain secret and internal to this file only to
        // guarantee that the linkage can be forged.
        const internalDomEvent = new CustomEvent(adapterContextToken, {
            bubbles: true,
            composed: true,
            detail(newContext: ContextValue, disconnectCallback: () => void) {
                // adds this callback into the disconnect bucket so it gets disconnected from parent
                // the the element hosting the wire is disconnected
                ArrayPush.call(wiredDisconnecting, disconnectCallback);
                // TODO: dev-mode validation of config based on the adapter.contextSchema
                callbackWhenContextIsReady(newContext);
            },
        });
        dispatchEvent.call(elm, internalDomEvent);
    });
}

function createConnector(vm: VM, name: string, wireDef: WireDef): WireAdapter {
    const { method, adapter } = wireDef;
    const dataCallback = isUndefined(method)
        ? createFieldDataCallback(vm, name)
        : createMethodDataCallback(vm, method);
    let context: ContextValue | undefined;
    let connector: WireAdapter;
    runWithBoundaryProtection(
        vm,
        vm,
        noop,
        () => {
            // job
            connector = new adapter(dataCallback);
        },
        noop
    );
    const computeConfigAndUpdate = createConfigWatcher(vm, wireDef, (config: ConfigValue) => {
        // every time the config is recomputed due to tracking,
        // this callback will be invoked with the new computed config
        runWithBoundaryProtection(
            vm,
            vm,
            noop,
            () => {
                // job
                connector.update(config, context);
            },
            noop
        );
    });
    // computing the initial config (no context at this point because the component is not connected)
    computeConfigAndUpdate();
    // if the adapter needs contextualization, we need to watch for new context and push it alongside the config
    if (!isUndefined(adapter.contextSchema)) {
        createContextWatcher(vm, wireDef, (newContext: ContextValue) => {
            // every time the context is pushed into this component,
            // this callback will be invoked with the new computed context
            if (context !== newContext) {
                context = newContext;
                // Note: when new context arrives, the config will be recomputed and pushed along side the new
                // context, this is to preserve the identity characteristics, config should not have identity
                // (ever), while context can have identity
                computeConfigAndUpdate();
            }
        });
    }
    // @ts-ignore the boundary protection executes sync, connector is always defined
    return connector;
}

type DataCallback = (value: any) => void;
type ConfigValue = Record<string, any>;

interface WireAdapter {
    update(config: ConfigValue, context?: ContextValue);
    connect();
    disconnect();
}

type WireAdapterSchemaValue = 'optional' | 'required';

interface WireDef {
    method?: (data: any) => void;
    adapter: WireAdapterConstructor;
    configCallback: ConfigCallback;
}

interface WireMethodDef extends WireDef {
    method: (data: any) => void;
}

interface WireFieldDef extends WireDef {
    method?: undefined;
}

const AdapterToTokenMap: Map<WireAdapterConstructor, string> = new Map();

export function getAdapterToken(adapter: WireAdapterConstructor): string | undefined {
    return AdapterToTokenMap.get(adapter);
}

export function setAdapterToken(adapter: WireAdapterConstructor, token: string) {
    AdapterToTokenMap.set(adapter, token);
}

export type ContextValue = Record<string, any>;
export type ConfigCallback = (component: ComponentInterface) => ConfigValue;
export interface WireAdapterConstructor {
    new (callback: DataCallback): WireAdapter;
    configSchema?: Record<string, WireAdapterSchemaValue>;
    contextSchema?: Record<string, WireAdapterSchemaValue>;
}

export function storeWiredMethodMeta(
    descriptor: PropertyDescriptor,
    adapter: WireAdapterConstructor,
    configCallback: ConfigCallback
) {
    // support for callable adapters
    if ((adapter as any).adapter) {
        adapter = (adapter as any).adapter;
    }
    const method = descriptor.value;
    const def: WireMethodDef = {
        adapter,
        method,
        configCallback,
    };
    WireMetaMap.set(descriptor, def);
}

export function storeWiredFieldMeta(
    descriptor: PropertyDescriptor,
    adapter: WireAdapterConstructor,
    configCallback: ConfigCallback
) {
    // support for callable adapters
    if ((adapter as any).adapter) {
        adapter = (adapter as any).adapter;
    }
    const def: WireFieldDef = {
        adapter,
        configCallback,
    };
    WireMetaMap.set(descriptor, def);
}

export function installWireAdapters(vm: VM) {
    const {
        def: { wire },
    } = vm;
    if (getOwnPropertyNames(wire).length === 0) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Internal Error: wire adapters should only be installed in instances with at least one wire declaration.`
            );
        }
    } else {
        const connect = (vm.context.wiredConnecting = []);
        const disconnect = (vm.context.wiredDisconnecting = []);
        for (const fieldNameOrMethod in wire) {
            const descriptor = wire[fieldNameOrMethod];
            const wireDef = WireMetaMap.get(descriptor);
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(wireDef, `Internal Error: invalid wire definition found.`);
            }
            if (!isUndefined(wireDef)) {
                const adapterInstance = createConnector(vm, fieldNameOrMethod, wireDef);
                ArrayPush.call(connect, () => adapterInstance.connect());
                ArrayPush.call(disconnect, () => adapterInstance.disconnect());
            }
        }
    }
}

export function connectWireAdapters(vm: VM) {
    const {
        context: { wiredConnecting },
    } = vm;
    if (isUndefined(wiredConnecting)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Internal Error: wire adapters must be installed in instances with at least one wire declaration.`
            );
        }
    }
    for (let i = 0, len = wiredConnecting.length; i < len; i += 1) {
        wiredConnecting[i]();
    }
}

export function disconnectWireAdapters(vm: VM) {
    const {
        context: { wiredDisconnecting },
    } = vm;
    if (isUndefined(wiredDisconnecting)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Internal Error: wire adapters must be installed in instances with at least one wire declaration.`
            );
        }
    }
    runWithBoundaryProtection(
        vm,
        vm,
        noop,
        () => {
            // job
            for (let i = 0, len = wiredDisconnecting.length; i < len; i += 1) {
                wiredDisconnecting[i]();
            }
        },
        noop
    );
}
