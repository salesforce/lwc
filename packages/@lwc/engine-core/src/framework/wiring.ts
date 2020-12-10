/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined, ArrayPush, defineProperty, defineProperties } from '@lwc/shared';
import { ComponentInterface } from './component';
import { componentValueMutated, ReactiveObserver } from './mutation-tracker';
import { VM, runWithBoundaryProtection, WireConnector } from './vm';
import { HostElement, Renderer } from './renderer';

const DeprecatedWiredElementHost = '$$DeprecatedWiredElementHostKey$$';
const DeprecatedWiredParamsMeta = '$$DeprecatedWiredParamsMetaKey$$';

const WireMetaMap: Map<PropertyDescriptor, WireDef> = new Map();
function noop(): void {}

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
    component: ComponentInterface,
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
    adapter: WireAdapterConstructor,
    elm: HostElement,
    renderer: Renderer,
    computeConfigAndUpdate: () => void
): ContextWatcher | undefined {
    if (isUndefined(adapter.contextSchema)) {
        return; // no config watcher required
    }

    const adapterContextToken = getAdapterToken(adapter);
    if (isUndefined(adapterContextToken)) {
        return; // no provider found, nothing to be done
    }

    let isConnected = false;
    let context: ContextValue | undefined;
    const wiredDisconnecting: Array<() => void> = [];

    return {
        connect() {
            isConnected = true;

            // This event is responsible for connecting the host element with another
            // element in the composed path that is providing contextual data. The provider
            // must be listening for a special dom event with the name corresponding to the value of
            // `adapterContextToken`, which will remain secret and internal to this file only to
            // guarantee that the linkage can be forged.
            const contextRegistrationEvent = new WireContextRegistrationEvent(adapterContextToken, {
                setNewContext(newContext: ContextValue) {
                    // eslint-disable-next-line lwc-internal/no-invalid-todo
                    // TODO: dev-mode validation of config based on the adapter.contextSchema
                    if (context !== newContext) {
                        context = newContext;
                        // Note: when new context arrives, the config will be recomputed and pushed along side the new
                        // context, this is to preserve the identity characteristics, config should not have identity
                        // (ever), while context can have identity
                        if (isConnected) {
                            computeConfigAndUpdate();
                        }
                    }
                },
                setDisconnectedCallback(disconnectCallback: () => void) {
                    // adds this callback into the disconnect bucket so it gets disconnected from parent
                    // the the element hosting the wire is disconnected
                    ArrayPush.call(wiredDisconnecting, disconnectCallback);
                },
            });
            renderer.dispatchEvent(elm, contextRegistrationEvent);
        },
        disconnect() {
            isConnected = false;

            for (let i = 0, n = wiredDisconnecting.length; i < n; i++) {
                wiredDisconnecting[i]();
            }
        },
        get contextValue() {
            return context;
        },
    };
}

function createConnector(vm: VM, name: string, wireDef: WireDef): WireConnector {
    const { method, adapter, configCallback, dynamic } = wireDef;
    const hasDynamicParams = dynamic.length > 0;
    const dataCallback = isUndefined(method)
        ? createFieldDataCallback(vm, name)
        : createMethodDataCallback(vm, method);
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

    let contextWatcher: ContextWatcher | undefined;

    const updateConnectorConfig = (config: ConfigValue) => {
        // every time the config is recomputed due to tracking,
        // this callback will be invoked with the new computed config
        runWithBoundaryProtection(
            vm,
            vm,
            noop,
            () => {
                // job
                connector.update(config, contextWatcher?.contextValue);
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

    contextWatcher = createContextWatcher(adapter, vm.elm, vm.renderer, computeConfigAndUpdate);

    return {
        connect() {
            runWithBoundaryProtection(
                vm,
                vm,
                noop,
                () => {
                    connector.connect();

                    contextWatcher?.connect();
                },
                noop
            );

            // computeConfigAndUpdate already has boundary protection
            if (hasDynamicParams) {
                Promise.resolve().then(computeConfigAndUpdate);
            } else {
                computeConfigAndUpdate();
            }
        },
        disconnect() {
            runWithBoundaryProtection(
                vm,
                vm,
                noop,
                () => {
                    connector.disconnect();

                    contextWatcher?.disconnect();
                },
                noop
            );

            ro.reset();
        },
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
export type ConfigCallback = (component: ComponentInterface) => ConfigValue;

interface ContextWatcher {
    connect: () => void;
    disconnect: () => void;
    readonly contextValue: ContextValue | undefined;
}

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

    const wiredConnectors: WireConnector[] = (context.wiredConnectors = []);

    for (const fieldNameOrMethod in wire) {
        const descriptor = wire[fieldNameOrMethod];
        const wireDef = WireMetaMap.get(descriptor);
        if (process.env.NODE_ENV !== 'production') {
            assert.invariant(wireDef, `Internal Error: invalid wire definition found.`);
        }
        if (!isUndefined(wireDef)) {
            const connector = createConnector(vm, fieldNameOrMethod, wireDef);

            wiredConnectors.push(connector);
        }
    }
}

export function connectWireAdapters(vm: VM) {
    const { wiredConnectors } = vm.context;

    for (let i = 0, len = wiredConnectors.length; i < len; i += 1) {
        wiredConnectors[i].connect();
    }
}

export function disconnectWireAdapters(vm: VM) {
    const { wiredConnectors } = vm.context;

    for (let i = 0, len = wiredConnectors.length; i < len; i += 1) {
        wiredConnectors[i].disconnect();
    }
}
