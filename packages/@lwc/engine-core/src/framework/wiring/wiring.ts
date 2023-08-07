/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { assert, create, isUndefined, ArrayPush, defineProperty, noop } from '@lwc/shared';
import { LightningElement } from '../base-lightning-element';
import { createReactiveObserver, ReactiveObserver } from '../mutation-tracker';
import { runWithBoundaryProtection, VMState, VM } from '../vm';
import { updateComponentValue } from '../update-component-value';
import { createContextWatcher } from './context';
import type {
    ConfigCallback,
    ConfigValue,
    ContextValue,
    WireAdapter,
    WireAdapterConstructor,
    WireDebugInfo,
    WireDef,
    WireMethodDef,
    WireFieldDef,
} from './types';

const DeprecatedWiredElementHost = '$$DeprecatedWiredElementHostKey$$';
const DeprecatedWiredParamsMeta = '$$DeprecatedWiredParamsMetaKey$$';
const WIRE_DEBUG_ENTRY = '@wire';

const WireMetaMap: Map<PropertyDescriptor, WireDef> = new Map();

function createFieldDataCallback(vm: VM, name: string) {
    return (value: any) => {
        updateComponentValue(vm, name, value);
    };
}

function createMethodDataCallback(vm: VM, method: (data: any) => any) {
    return (value: any) => {
        // dispatching new value into the wired method
        runWithBoundaryProtection(
            vm,
            vm.owner,
            noop,
            () => {
                // job
                method.call(vm.component, value);
            },
            noop
        );
    };
}

function createConfigWatcher(
    component: LightningElement,
    configCallback: ConfigCallback,
    callbackWhenConfigIsReady: (newConfig: ConfigValue) => void
): { computeConfigAndUpdate: () => void; ro: ReactiveObserver } {
    let hasPendingConfig: boolean = false;
    // creating the reactive observer for reactive params when needed
    const ro = createReactiveObserver(() => {
        if (hasPendingConfig === false) {
            hasPendingConfig = true;
            // collect new config in the micro-task
            Promise.resolve().then(() => {
                hasPendingConfig = false;
                // resetting current reactive params
                ro.reset();
                // dispatching a new config due to a change in the configuration
                computeConfigAndUpdate();
            });
        }
    });
    const computeConfigAndUpdate = () => {
        let config: ConfigValue;
        ro.observe(() => (config = configCallback(component)));
        // eslint-disable-next-line @lwc/lwc-internal/no-invalid-todo
        // TODO: dev-mode validation of config based on the adapter.configSchema
        // @ts-ignore it is assigned in the observe() callback
        callbackWhenConfigIsReady(config);
    };
    return {
        computeConfigAndUpdate,
        ro,
    };
}

function createConnector(
    vm: VM,
    name: string,
    wireDef: WireDef
): {
    connector: WireAdapter;
    computeConfigAndUpdate: () => void;
    resetConfigWatcher: () => void;
} {
    const { method, adapter, configCallback, dynamic } = wireDef;
    let debugInfo: WireDebugInfo;

    if (process.env.NODE_ENV !== 'production') {
        const wiredPropOrMethod = isUndefined(method) ? name : method.name;

        debugInfo = create(null) as WireDebugInfo;

        debugInfo.wasDataProvisionedForConfig = false;
        vm.debugInfo![WIRE_DEBUG_ENTRY][wiredPropOrMethod] = debugInfo;
    }

    const fieldOrMethodCallback = isUndefined(method)
        ? createFieldDataCallback(vm, name)
        : createMethodDataCallback(vm, method);

    const dataCallback = (value: any) => {
        if (process.env.NODE_ENV !== 'production') {
            debugInfo.data = value;

            // Note: most of the time, the data provided is for the current config, but there may be
            // some conditions in which it does not, ex:
            // race conditions in a poor network while the adapter does not cancel a previous request.
            debugInfo.wasDataProvisionedForConfig = true;
        }

        fieldOrMethodCallback(value);
    };

    let context: ContextValue | undefined;
    let connector: WireAdapter;

    // Workaround to pass the component element associated to this wire adapter instance.
    defineProperty(dataCallback, DeprecatedWiredElementHost, {
        value: vm.elm,
    });
    defineProperty(dataCallback, DeprecatedWiredParamsMeta, {
        value: dynamic,
    });

    runWithBoundaryProtection(
        vm,
        vm,
        noop,
        () => {
            // job
            connector = new adapter(dataCallback, { tagName: vm.tagName });
        },
        noop
    );
    const updateConnectorConfig = (config: ConfigValue) => {
        // every time the config is recomputed due to tracking,
        // this callback will be invoked with the new computed config
        runWithBoundaryProtection(
            vm,
            vm,
            noop,
            () => {
                // job
                if (process.env.NODE_ENV !== 'production') {
                    debugInfo.config = config;
                    debugInfo.context = context;
                    debugInfo.wasDataProvisionedForConfig = false;
                }

                connector.update(config, context);
            },
            noop
        );
    };

    // Computes the current wire config and calls the update method on the wire adapter.
    // If it has params, we will need to observe changes in the next tick.
    const { computeConfigAndUpdate, ro } = createConfigWatcher(
        vm.component,
        configCallback,
        updateConnectorConfig
    );

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
                if (vm.state === VMState.connected) {
                    computeConfigAndUpdate();
                }
            }
        });
    }
    return {
        // @ts-ignore the boundary protection executes sync, connector is always defined
        connector,
        computeConfigAndUpdate,
        resetConfigWatcher: () => ro.reset(),
    };
}

export function storeWiredMethodMeta(
    descriptor: PropertyDescriptor,
    adapter: WireAdapterConstructor,
    configCallback: ConfigCallback,
    dynamic: string[]
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
        dynamic,
    };
    WireMetaMap.set(descriptor, def);
}

export function storeWiredFieldMeta(
    descriptor: PropertyDescriptor,
    adapter: WireAdapterConstructor,
    configCallback: ConfigCallback,
    dynamic: string[]
) {
    // support for callable adapters
    if ((adapter as any).adapter) {
        adapter = (adapter as any).adapter;
    }
    const def: WireFieldDef = {
        adapter,
        configCallback,
        dynamic,
    };
    WireMetaMap.set(descriptor, def);
}

export function installWireAdapters(vm: VM) {
    const {
        context,
        def: { wire },
    } = vm;

    if (process.env.NODE_ENV !== 'production') {
        vm.debugInfo![WIRE_DEBUG_ENTRY] = create(null);
    }

    const wiredConnecting = (context.wiredConnecting = []);
    const wiredDisconnecting = (context.wiredDisconnecting = []);

    for (const fieldNameOrMethod in wire) {
        const descriptor = wire[fieldNameOrMethod];
        const wireDef = WireMetaMap.get(descriptor);
        if (process.env.NODE_ENV !== 'production') {
            assert.invariant(wireDef, `Internal Error: invalid wire definition found.`);
        }
        if (!isUndefined(wireDef)) {
            const { connector, computeConfigAndUpdate, resetConfigWatcher } = createConnector(
                vm,
                fieldNameOrMethod,
                wireDef
            );
            const hasDynamicParams = wireDef.dynamic.length > 0;
            ArrayPush.call(wiredConnecting, () => {
                connector.connect();
                if (!lwcRuntimeFlags.ENABLE_WIRE_SYNC_EMIT) {
                    if (hasDynamicParams) {
                        Promise.resolve().then(computeConfigAndUpdate);
                        return;
                    }
                }

                computeConfigAndUpdate();
            });
            ArrayPush.call(wiredDisconnecting, () => {
                connector.disconnect();
                resetConfigWatcher();
            });
        }
    }
}

export function connectWireAdapters(vm: VM) {
    const { wiredConnecting } = vm.context;

    for (let i = 0, len = wiredConnecting.length; i < len; i += 1) {
        wiredConnecting[i]();
    }
}

export function disconnectWireAdapters(vm: VM) {
    const { wiredDisconnecting } = vm.context;

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
