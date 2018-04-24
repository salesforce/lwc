import assert from "./assert";
import { ArrayMap, isArray, isNull, toString } from "./language";
import { ReactiveMembrane, unwrap as observableUnwrap } from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";

function format(value: any) {
    if (process.env.NODE_ENV !== 'production') {
        // For now, if we determine that value is a piercing membrane
        // we want to throw a big error.
        if (replicaUnwrap(value) !== value) {
            throw new ReferenceError(`Invalid attempt to get access to a piercing membrane ${toString(value)} via a reactive membrane.`);
        }
    }
    return value;
}

export const reactiveMembrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export function dangerousObjectMutation(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`Dangerously Mutating Object ${toString(obj)}. This object was passed to you from a parent component, and should not be mutated here. This will be removed in the near future.`);
    }
    return reactiveMembrane.getProxy(unwrap(obj));
}

export interface ReplicableFunction {
    new (...args: any[]): any;
    (...args: any[]): any;
    // TODO: key could be number or symbol
    [key: string]: any;
}
export type Replicable = object | ReplicableFunction;

export type ReplicaFunction = (...args: any[]) => Replica | String | Number | Boolean | null | undefined;
export type Replica = object | ReplicaFunction;

export interface MembraneHandler {
    get(membrane: Membrane, target: Replicable, key: PropertyKey): any;
    set(membrane: Membrane, target: Replicable, key: PropertyKey, newValue: any): boolean;
    deleteProperty(membrane: Membrane, target: Replicable, key: PropertyKey): boolean;
    apply(membrane: Membrane, targetFn: ReplicableFunction, thisArg: any, argumentsList: any[]): any;
    construct(membrane: Membrane, targetFn: ReplicableFunction, argumentsList: any[], newTarget: any): any;
}

export const TargetSlot = Symbol();

const MembraneSlot = Symbol();

export function isReplicable(value: any): boolean {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
const { getKey: ProxyGetKey } = Proxy;
const getKey = ProxyGetKey ? ProxyGetKey : (o: any, key: PropertyKey): any => o[key];

export function replicaUnwrap(value: any): any {
    // observable membrane goes first because it is in the critical path
    return (value && getKey(value, TargetSlot)) || value;
}

export function getReplica(piercingMembrane: Membrane, value: Replicable | any): Replica | any {
    if (isNull(value)) {
        return value;
    }
    const replicaRawValue = replicaUnwrap(value);
    if (!isReplicable(replicaRawValue)) {
        return replicaRawValue;
    }
    const reactiveRawValue = observableUnwrap(replicaRawValue);
    if (replicaRawValue !== reactiveRawValue) {
        // user is accessing a reactive membrane via a piercing membrane
        // in which case we return a readonly version of the reactive one
        return reactiveMembrane.getReadOnlyProxy(reactiveRawValue);
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(piercingMembrane instanceof Membrane, `getReplica() first argument must be a membrane.`);
    }
    const { cells } = piercingMembrane;
    const r = cells.get(replicaRawValue);
    if (r) {
        return r;
    }
    const replica: Replica = new Proxy(replicaRawValue, (piercingMembrane as ProxyHandler<Replicable>));
    cells.set(replicaRawValue, replica);
    return replica;
}

export class Membrane {
    handler: MembraneHandler;
    cells: WeakMap<Replicable, Replica>;
    constructor(handler: MembraneHandler) {
        this.handler = handler;
        this.cells = new WeakMap();
    }
    get(target: Replicable, key: PropertyKey): any {
        if (key === TargetSlot) {
            return target;
        } else if (key === MembraneSlot) {
            return this;
        }
        return this.handler.get(this, target, key);
    }
    set(target: Replicable, key: PropertyKey, newValue: any): boolean {
        return this.handler.set(this, target, key, newValue);
    }
    deleteProperty(target: Replicable, key: PropertyKey): boolean {
        if (key === TargetSlot) {
            return false;
        }
        return this.handler.deleteProperty(this, target, key);
    }
    apply(target: ReplicableFunction, thisArg: any, argumentsList: any[]): any {
        thisArg = unwrap(thisArg);
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.apply(this, target, thisArg, argumentsList);
    }
    construct(target: ReplicableFunction, argumentsList: any[], newTarget: any): any {
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.construct(this, target, argumentsList, newTarget);
    }
}

// Universal unwrap mechanism that works for any type of membrane
export function unwrap(value: any): any {
    // observable membrane goes first because it is in the critical path
    let unwrapped = observableUnwrap(value);
    if (unwrapped !== value) {
        return unwrapped;
    }
    // piercing membrane is not that important, it goes second
    unwrapped = replicaUnwrap(value);
    if (unwrapped !== value) {
        return unwrapped;
    }
    return value;
}
