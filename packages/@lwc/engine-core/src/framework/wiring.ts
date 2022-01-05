/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    isUndefined,
    ArrayPush,
    defineProperty,
    defineProperties,
    noop,
} from '@lwc/shared';
import featureFlags from '@lwc/features';
import { dispatchEvent } from '../renderer';
import { LightningElement } from './base-lightning-element';
import { componentValueMutated, ReactiveObserver } from './mutation-tracker';
import { runWithBoundaryProtection, VMState, VM } from './vm';

const DeprecatedWiredElementHost = '$$DeprecatedWiredElementHostKey$$';
const DeprecatedWiredParamsMeta = '$$DeprecatedWiredParamsMetaKey$$';

const WireMetaMap: Map<PropertyDescriptor, WireDef> = new Map();

interface WireContextInternalEventPayload {
    setNewContext(newContext: ContextValue): void;
    setDisconnectedCallback(disconnectCallback: () => void): void;
}

export class WireContextRegistrationEvent extends CustomEvent<undefined> {
    // These are initialized on the constructor via defineProperties.
    public readonly setNewContext!: (newContext: ContextValue) => void;
    public readonly setDisconnectedCallback!: (disconnectCallback: () => void) => void;

    constructor(
        adapterToken: string,
        { setNewContext, setDisconnectedCallback }: WireContextInternalEventPayload
    ) {
        super(adapterToken, {
            bubbles: true,
            composed: true,
        });

        defineProperties(this, {
            setNewContext: {
                value: setNewContext,
            },
            setDisconnectedCallback: {
                value: setDisconnectedCallback,
            },
        });
    }
}

function createFieldDataCallback(vm: VM, name: string) {
    const { cmpFields } = vm;
    return (value: any) => {
        if (value !== vm.cmpFields[name]) {
            // storing the value in the underlying storage
            cmpFields[name] = value;

            componentValueMutated(vm, name);
        }
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
    const ro = new ReactiveObserver(() => {
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
        // eslint-disable-next-line lwc-internal/no-invalid-todo
        // TODO: dev-mode validation of config based on the adapter.configSchema
        // @ts-ignore it is assigned in the observe() callback
        callbackWhenConfigIsReady(config);
    };
    return {
        computeConfigAndUpdate,
        ro,
    };
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
        const contextRegistrationEvent = new WireContextRegistrationEvent(adapterContextToken, {
            setNewContext(newContext: ContextValue) {
                // eslint-disable-next-line lwc-internal/no-invalid-todo
                // TODO: dev-mode validation of config based on the adapter.contextSchema
                callbackWhenContextIsReady(newContext);
            },
            setDisconnectedCallback(disconnectCallback: () => void) {
                // adds this callback into the disconnect bucket so it gets disconnected from parent
                // the the element hosting the wire is disconnected
                ArrayPush.call(wiredDisconnecting, disconnectCallback);
            },
        });
        dispatchEvent(elm, contextRegistrationEvent);
    });
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
    const dataCallback = isUndefined(method)
        ? createFieldDataCallback(vm, name)
        : createMethodDataCallback(vm, method);
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
            connector = new adapter(dataCallback);
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

export type DataCallback = (value: any) => void;
export type ConfigValue = Record<string, any>;

export interface WireAdapter {
    update(config: ConfigValue, context?: ContextValue): void;
    connect(): void;
    disconnect(): void;
}

export type WireAdapterSchemaValue = 'optional' | 'required';

interface WireDef {
    method?: (data: any) => void;
    adapter: WireAdapterConstructor;
    dynamic: string[];
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
export type ConfigCallback = (component: LightningElement) => ConfigValue;

export interface WireAdapterConstructor {
    new (callback: DataCallback): WireAdapter;
    configSchema?: Record<string, WireAdapterSchemaValue>;
    contextSchema?: Record<string, WireAdapterSchemaValue>;
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
                if (!featureFlags.ENABLE_WIRE_SYNC_EMIT) {
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
