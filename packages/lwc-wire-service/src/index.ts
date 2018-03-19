/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import { Element } from 'engine';
import assert from './assert';
import { WireDef, ElementDef } from './shared-types';

export interface WiredValue {
    data?: any;
    error?: any;
}
export type TargetSetter = (WiredValue) => void;
export type UpdatedCallback = (object) => void;
export type NoArgumentCallback = () => void;
export type WireAdapterCallback = UpdatedCallback | NoArgumentCallback;
export interface WireAdapter {
    updatedCallback?: UpdatedCallback;
    connectedCallback?: NoArgumentCallback;
    disconnectedCallback?: NoArgumentCallback;
}
export type WireAdapterFactory = (targetSetter: TargetSetter) => WireAdapter;

export interface UpdatedCallbackConfig {
    updatedCallback: UpdatedCallback;
    statics: {
        [key: string]: any;
    };
    params: {
        [key: string]: string;
    };
}
export interface ServiceUpdateContext {
    callbacks: UpdatedCallbackConfig[];
    // union of callbacks.params values
    paramValues: Set<string>;
}
export type ServiceContext = NoArgumentCallback[] | ServiceUpdateContext;

// key for engine service context store
const CONTEXT_ID: string = '@wire';

// wire adapters: wire adapter id => adapter ctor
const adapterFactories: Map<any, WireAdapterFactory> = new Map<any, WireAdapterFactory>();

const UPDATED: string = 'updated';
const CONNECTED: string = 'connectedCallback';
const DISCONNECTED: string = 'disconnectedCallback';

/**
 * Invokes the specified callbacks.
 */
function invokeCallback(callbacks: NoArgumentCallback[]) {
    for (let i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].call(undefined);
    }
}

/**
 * Invokes the provided updated callbacks with the resolved component properties.
 */
function invokeUpdatedCallback(ucMetadatas: UpdatedCallbackConfig[], paramValues: any) {
    for (let i = 0, len = ucMetadatas.length; i < len; ++i) {
        const { updatedCallback, statics, params } = ucMetadatas[i];

        const resolvedParams = Object.create(null);
        const keys = Object.keys(params);
        for (let j = 0, jlen = keys.length; j < jlen; j++) {
            const key = keys[j];
            const value = paramValues[params[key]];
            resolvedParams[key] = value;
        }
        const config = Object.assign(Object.create(null), statics, resolvedParams);
        updatedCallback.call(undefined, config);
    }
}

/**
 * Gets resolved values of the specified properties.
 */
function getPropertyValues(cmp: Element, properties: Set<string>) {
    const resolvedValues = Object.create(null);
    properties.forEach((property) => {
        const paramValue = property;
        resolvedValues[paramValue] = cmp[paramValue];
    });

    return resolvedValues;
}

function buildContext(
    connectedNoArgCallbacks: NoArgumentCallback[],
    disconnectedNoArgCallbacks: NoArgumentCallback[],
    updatedCallbackConfigs: UpdatedCallbackConfig[],
    props: Set<string>
): Map<string, ServiceContext> {
    // cache context that optimizes runtime of service callbacks
    const wireContext: Map<string, ServiceContext> = Object.create(null);
    if (connectedNoArgCallbacks.length > 0) {
        wireContext[CONNECTED] = connectedNoArgCallbacks;
    }

    if (disconnectedNoArgCallbacks.length > 0) {
        wireContext[DISCONNECTED] = disconnectedNoArgCallbacks;
    }

    if (updatedCallbackConfigs.length > 0) {
        const ucContext: ServiceUpdateContext = {
            callbacks: updatedCallbackConfigs,
            paramValues: props
        };
        wireContext[UPDATED] = ucContext;
    }

    return wireContext;
}

// TODO - in early 216, engine will expose an `updated` callback for services that
// is invoked whenever a tracked property is changed. wire service is structured to
// make this adoption trivial.
function updated(cmp: Element, data: object, def: ElementDef, context: object) {
    let ucMetadata: ServiceUpdateContext;
    if (!def.wire || !(ucMetadata = context[CONTEXT_ID][UPDATED])) {
        return;
    }

    // get new values for all dynamic props
    const paramValues = getPropertyValues(cmp, ucMetadata.paramValues);

    // compare new to old dynamic prop values, updating old props with new values
    // for each change, queue the impacted adapter(s)
    // TODO: do we really need this if updated is only hooked to bound props?

    // process queue of impacted adapters
    invokeUpdatedCallback(ucMetadata.callbacks, paramValues);
}

function getPropsFromParams(wireDefs: WireDef[]) {
    const props = new Set<string>();
    wireDefs.forEach((wireDef) => {
        const { params } = wireDef;
        if (params) {
            Object.keys(params).forEach(param => {
                const prop = params[param];
                props.add(prop);
            });
        }
    });

    return props;
}

/**
 * The wire service.
 *
 * This service is registered with the engine's service API. It connects service
 * callbacks to wire adapter lifecycle callbacks.
 */
const wireService = {
    // TODO W-4072588 - support connected + disconnected (repeated) cycles
    wiring: (cmp: Element, data: object, def: ElementDef, context: object) => {
        // engine guarantees invocation only if def.wire is defined
        const wireStaticDef = def.wire;
        const wireTargets = Object.keys(wireStaticDef);
        const adapters: WireAdapter[] = [];
        const wireDefs: WireDef[] = [];
        const updatedCallbackKey = 'updatedCallback';
        const updatedCallbackConfigs: UpdatedCallbackConfig[] = [];
        const connectedNoArgCallbacks: NoArgumentCallback[] = [];
        const disconnectedNoArgCallbacks: NoArgumentCallback[] = [];
        for (let i = 0; i < wireTargets.length; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            wireDefs.push(wireDef);
            const id = wireDef.adapter || wireDef.type;

            // initialize wired property
            if (!wireDef.method) {
                cmp[wireTarget] = {};
            }

            const targetSetter: TargetSetter = wireDef.method ?
                (value) => { cmp[wireTarget](value); } :
                (value) => { Object.assign(cmp[wireTarget], value); };

            const adapterFactory = adapterFactories.get(id);
            if (adapterFactory) {
                const wireAdapter = adapterFactory(targetSetter);
                adapters.push(wireAdapter);
                const connectedCallback = wireAdapter[CONNECTED];
                if (connectedCallback) {
                    connectedNoArgCallbacks.push(connectedCallback);
                }
                const disconnectedCallback = wireAdapter[DISCONNECTED];
                if (disconnectedCallback) {
                    disconnectedNoArgCallbacks.push(disconnectedCallback);
                }
                const updatedCallback = wireAdapter[updatedCallbackKey];
                if (updatedCallback) {
                    updatedCallbackConfigs.push({
                        updatedCallback,
                        statics: wireDef.static,
                        params: wireDef.params
                    });
                }
            }
        }

        // only add updated to bound props
        const props = getPropsFromParams(wireDefs);
        props.forEach((prop) => {
            const originalDescriptor = Object.getOwnPropertyDescriptor(cmp.constructor.prototype, prop);
            let newDescriptor;
            if (originalDescriptor) {
                newDescriptor = Object.assign({}, originalDescriptor, {
                    set(value) {
                        if (originalDescriptor.set) {
                            originalDescriptor.set.call(cmp, value);
                        }
                        updated.call(this, cmp, data, def, context);
                    }
                });
            } else {
                const propSymbol = Symbol(prop);
                newDescriptor = {
                    get() {
                        return cmp[propSymbol];
                    },
                    set(value) {
                        cmp[propSymbol] = value;
                        updated.call(this, cmp, data, def, context);
                    }
                };
                // grab the existing value
                cmp[propSymbol] = cmp[prop];
            }
            Object.defineProperty(cmp, prop, newDescriptor);
        });

        // cache context that optimizes runtime of service callbacks
        context[CONTEXT_ID] = buildContext(connectedNoArgCallbacks, disconnectedNoArgCallbacks, updatedCallbackConfigs, props);
    },

    connected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][CONNECTED])) {
            return;
        }
        invokeCallback(callbacks);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][DISCONNECTED])) {
            return;
        }
        invokeCallback(callbacks);
    }
};

/**
 * Registers the wire service.
 */
export function registerWireService(registerService: Function) {
    registerService(wireService);
}

/**
 * Registers a wire adapter.
 */
export function register(adapterId: any, adapterFactory: WireAdapterFactory) {
    assert.isTrue(adapterId, 'adapter id must be truthy');
    assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a function');
    adapterFactories.set(adapterId, adapterFactory);
}

/*
 * Unregisters an adapter, only available for non prod (e.g. test util)
 */
export function unregister(adapterId: any) {
    if (process.env.NODE_ENV !== 'production') {
        adapterFactories.delete(adapterId);
    }
}
