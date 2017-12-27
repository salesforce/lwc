import assert from "./assert";
import { ArrayMap, isArray, isNull } from "./language";

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
export const MembraneSlot = Symbol();

export function isReplicable(value: any): boolean {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}

export function getReplica(membrane: Membrane, value: Replicable | any): Replica | any {
    if (isNull(value)) {
        return value;
    }
    value = unwrap(value);
    if (!isReplicable(value)) {
        return value;
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(membrane instanceof Membrane, `getReplica() first argument must be a membrane.`);
    }
    const { cells } = membrane;
    const r = cells.get(value);
    if (r) {
        return r;
    }
    const replica: Replica = new Proxy(value, (membrane as ProxyHandler<Replicable>));
    cells.set(value, replica);
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

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
const { getKey } = Proxy;

export const unwrap = getKey ?
    (replicaOrAny: Replica | any): Replicable | any => (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny
    : (replicaOrAny: Replica | any): Replicable | any => (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;
