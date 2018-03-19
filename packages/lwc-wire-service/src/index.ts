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

export type ServiceContext = WireAdapterCallback[];

// lifecycle hooks of wire adapters
// const HOOKS: Array<keyof WireAdapter> = ['updatedCallback', 'connectedCallback', 'disconnectedCallback'];

// key for engine service context store
const CONTEXT_ID: string = '@wire';

// wire adapters: wire adapter id => adapter ctor
const adapterFactories: Map<any, WireAdapterFactory> = new Map<any, WireAdapterFactory>();

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
function getPropertyValues(cmp: Element, properties: string[]) {
    const resolvedValues = Object.create(null);
    for (let i = 0, len = properties.length; i < len; ++i) {
        const paramValue = properties[i];
        resolvedValues[paramValue] = cmp[paramValue];
    }
    return resolvedValues;
}

/**
 * Build context payload.
 */
function buildContext(adapters: WireAdapter[]) {
    const context: Map<string, ServiceContext> = Object.create(null);

    const noArgCallbackKeys: Array<keyof WireAdapter> = ['connectedCallback', 'disconnectedCallback'];
    for (let i = 0; i < noArgCallbackKeys.length; i++) {
        const noArgCallbackKey = noArgCallbackKeys[i];
        const wireNoArgCallbacks: WireAdapterCallback[] = [];
        for (let j = 0; j < adapters.length; j++) {
            const wireNoArgCallback = adapters[j][noArgCallbackKey];
            if (wireNoArgCallback) {
                wireNoArgCallbacks.push(wireNoArgCallback);
            }
        }
        if (wireNoArgCallbacks.length > 0) {
            context[noArgCallbackKey] = wireNoArgCallbacks;
        }
    }

    const updatedCallbackKey = 'updatedCallback';
    const wireUpdatedCallbacks: UpdatedCallback[] = [];
    for (let j = 0; j < adapters.length; j++) {
        const updatedCallback = adapters[j][updatedCallbackKey];
        if (updatedCallback) {
            wireUpdatedCallbacks.push(updatedCallback);
        }
    }
    if (wireUpdatedCallbacks.length > 0) {
        context[updatedCallbackKey] = wireUpdatedCallbacks;
    }

    return context;
}

// TODO - in early 216, engine will expose an `updated` callback for services that
// is invoked whenever a tracked property is changed. wire service is structured to
// make this adoption trivial.
function updated(cmp: Element, data: object, def: ElementDef, context: object) {
    let ucMetadata: ServiceUpdateContext;
    if (!def.wire || !(ucMetadata = context[CONTEXT_ID].updated)) {
        return;
    }
    // get new values for all dynamic props
    const paramValues = getPropertyValues(cmp, ucMetadata.paramValues);

    // compare new to old dynamic prop values, updating old props with new values
    // for each change, queue the impacted adapter(s)

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
        for (let i = 0; i < wireTargets.length; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            wireDefs.push(wireDef);
            const id = wireDef.adapter || wireDef.type;

            const targetSetter: TargetSetter = wireDef.method ?
                (value) => { cmp[wireTarget](value); } :
                (value) => { Object.assign(cmp[wireTarget], value); };

            const adapterFactory = adapterFactories.get(id);
            if (adapterFactory) {
                adapters.push(adapterFactory(targetSetter));
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
                        updated.bind(this, cmp, data, def, context);
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
                        updated.bind(this, cmp, data, def, context);
                    }
                };
                // grab the existing value
                cmp[propSymbol] = cmp[prop];
            }
            Object.defineProperty(cmp, prop, newDescriptor);
        });

        // cache context that optimizes runtime of service callbacks
        context[CONTEXT_ID] = buildContext(adapters);
    },

    connected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID].connected)) {
            return;
        }
        invokeCallback(callbacks);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID].disconnected)) {
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
