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
    forEach,
} from '@lwc/shared';
import { ComponentInterface } from './component';
import { componentValueMutated, ReactiveObserver } from './mutation-tracker';
import { VM, runWithBoundaryProtection, WireConnector } from './vm';

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

interface WireAdapterDecorator extends WireAdapter {
    computeConfig: () => ConfigValue;
}

class BaseWireAdapter implements WireAdapterDecorator {
    private readonly vm;
    private readonly connector;
    private readonly configCallback;
    private readonly component;

    constructor(connector: WireAdapter, vm: VM, configCallback: ConfigCallback) {
        this.connector = connector;
        this.vm = vm;
        this.component = vm.component;
        this.configCallback = configCallback;
    }

    computeConfig() {
        return this.configCallback(this.component);
    }

    update(config: ConfigValue, context?: ContextValue) {
        runWithBoundaryProtection(
            this.vm,
            this.vm,
            noop,
            () => {
                // job
                this.connector.update(config, context);
            },
            noop
        );
    }

    connect() {
        runWithBoundaryProtection(
            this.vm,
            this.vm,
            noop,
            () => {
                // job
                this.connector.connect();
            },
            noop
        );
    }

    disconnect() {
        runWithBoundaryProtection(
            this.vm,
            this.vm,
            noop,
            () => {
                // job
                this.connector.disconnect();
            },
            noop
        );
    }
}

class ContextAwareWireAdapter implements WireAdapterDecorator {
    private readonly decoratedWireAdapter;
    private readonly vm;
    private readonly adapterContextToken;
    private readonly renderer;
    private readonly elm;

    private context: ContextValue | undefined;
    private wiredDisconnecting: Array<() => void> = [];

    private setNewContext = (newContext: ContextValue) => {
        // eslint-disable-next-line lwc-internal/no-invalid-todo
        // TODO: dev-mode validation of config based on the adapter.contextSchema
        if (this.context !== newContext) {
            this.context = newContext;

            // Note: when new context arrives, the config will be recomputed and pushed along side the new
            // context, this is to preserve the identity characteristics, config should not have identity
            // (ever), while context can have identity
            const config = this.computeConfig();
            this.update(config);
        }
    };

    private setDisconnectedCallback = (disconnectCallback: () => void) => {
        // adds this callback into the disconnect bucket so it gets disconnected from parent
        // when the element hosting the wire is disconnected
        ArrayPush.call(this.wiredDisconnecting, disconnectCallback);
    };

    constructor(
        decoratedWireAdapter: WireAdapterDecorator,
        vm: VM,
        adapter: WireAdapterConstructor
    ) {
        this.decoratedWireAdapter = decoratedWireAdapter;
        this.vm = vm;
        this.adapterContextToken = getAdapterToken(adapter);
        this.renderer = vm.renderer;
        this.elm = vm.elm;
    }

    computeConfig() {
        return this.decoratedWireAdapter.computeConfig();
    }

    update(config: ConfigValue) {
        this.decoratedWireAdapter.update(config, this.context);
    }

    connect() {
        this.decoratedWireAdapter.connect();

        if (!isUndefined(this.adapterContextToken)) {
            // This event is responsible for connecting the host element with another
            // element in the composed path that is providing contextual data. The provider
            // must be listening for a special dom event with the name corresponding to the value of
            // `adapterContextToken`, which will remain secret and internal to this file only to
            // guarantee that the linkage can't be forged.
            const contextRegistrationEvent = new WireContextRegistrationEvent(
                this.adapterContextToken,
                {
                    setNewContext: this.setNewContext,
                    setDisconnectedCallback: this.setDisconnectedCallback,
                }
            );

            this.renderer.dispatchEvent(this.elm, contextRegistrationEvent);
        }
    }

    disconnect() {
        runWithBoundaryProtection(
            this.vm,
            this.vm,
            noop,
            () => {
                // job
                forEach.call(this.wiredDisconnecting, (cb) => cb());
            },
            noop
        );

        this.decoratedWireAdapter.disconnect();
    }
}

class ConfigAwareWireAdapter implements WireAdapterDecorator {
    private readonly decoratedWireAdapter: WireAdapterDecorator;
    private readonly hasDynamicConfigParams: boolean;
    private readonly ro: ReactiveObserver;
    private hasPendingConfig = false;

    private handleConfigChange = () => {
        if (this.hasPendingConfig === false) {
            this.hasPendingConfig = true;
            // Debounce all config changes until next micro-task
            Promise.resolve().then(this.handleDebouncedConfigChanges);
        }
    };

    private handleDebouncedConfigChanges = () => {
        this.hasPendingConfig = false;
        // resetting current reactive params
        this.ro.reset();
        // dispatching a new config due to a change in the configuration
        this.computeConfigAndUpdate();
    };

    private computeConfigAndUpdate = () => {
        let config: ConfigValue;
        this.ro.observe(() => (config = this.computeConfig()));
        // eslint-disable-next-line lwc-internal/no-invalid-todo
        // TODO: dev-mode validation of config based on the adapter.configSchema
        this.update(config!);
    };

    constructor(
        decoratedWireAdapter: WireAdapterDecorator,
        vm: VM,
        hasDynamicConfigParams: boolean
    ) {
        this.decoratedWireAdapter = decoratedWireAdapter;

        this.ro = new ReactiveObserver(this.handleConfigChange);
        this.hasDynamicConfigParams = hasDynamicConfigParams;
    }

    computeConfig() {
        return this.decoratedWireAdapter.computeConfig();
    }

    update(config: ConfigValue) {
        this.decoratedWireAdapter.update(config);
    }

    connect() {
        this.decoratedWireAdapter.connect();

        if (this.hasDynamicConfigParams) {
            Promise.resolve().then(this.computeConfigAndUpdate);
        } else {
            this.computeConfigAndUpdate();
        }
    }

    disconnect() {
        this.ro.reset();

        this.decoratedWireAdapter.disconnect();
    }
}

function createConnector(vm: VM, name: string, wireDef: WireDef): WireConnector {
    const { method, adapter, dynamic } = wireDef;
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

    let wireConnector: WireAdapterDecorator = new BaseWireAdapter(
        connector!,
        vm,
        wireDef.configCallback
    );

    if (!isUndefined(adapter.contextSchema)) {
        wireConnector = new ContextAwareWireAdapter(wireConnector, vm, adapter);
    }

    wireConnector = new ConfigAwareWireAdapter(wireConnector, vm, dynamic.length > 0);

    return wireConnector;
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
    // Note: A new array has to be allocated here. Until this point, all the VM has shared the same reference to an empty array/
    const wiredConnectors: WireConnector[] = (context.wiredConnectors = []);

    for (const fieldNameOrMethod in wire) {
        const descriptor = wire[fieldNameOrMethod];
        const wireDef = WireMetaMap.get(descriptor);
        if (process.env.NODE_ENV !== 'production') {
            assert.invariant(wireDef, `Internal Error: invalid wire definition found.`);
        }
        if (!isUndefined(wireDef)) {
            const connector = createConnector(vm, fieldNameOrMethod, wireDef);

            ArrayPush.call(wiredConnectors, connector);
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
