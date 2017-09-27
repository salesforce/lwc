import assert from "./assert";
import { ArrayMap, isArray, isNull } from "./language";

/*eslint-disable*/
export type ReplicableFunction = (...args: Array<any>) => any;
export type Replicable = Object | ReplicableFunction;

export type ReplicaFunction = (...args: Array<any>) => Replica | String | Number | Boolean | null | undefined;
export type Replica = Object | ReplicaFunction;

export interface MembraneHandler {
    get(membrane: Membrane, target: Replicable, key: string | Symbol): any;
    set(membrane: Membrane, target: Replicable, key: string | Symbol, newValue: any): boolean;
    deleteProperty(membrane: Membrane, target: Replicable, key: string | Symbol): boolean;
    apply(membrane: Membrane, targetFn: ReplicableFunction, thisArg: any, argumentsList: Array<any>): any;
    construct(membrane: Membrane, targetFn: ReplicableFunction, argumentsList: Array<any>, newTarget: any): any;
}
/*eslint-enable*/

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
    assert.isTrue(membrane instanceof Membrane, `getReplica() first argument must be a membrane.`);
    let { cells } = membrane;
    const r = cells.get(value);
    if (r) {
        return r;
    }
    const replica: Replica = new Proxy(value, (membrane as ProxyHandler<Replicable>)); // eslint-disable-line no-undef
    cells.set(value, replica);
    return replica;
}

export class Membrane {
    handler: MembraneHandler; // eslint-disable-line no-undef
    cells: WeakMap<Replicable, Replica>; // eslint-disable-line no-undef
    constructor(handler: MembraneHandler) {
        this.handler = handler;
        this.cells = new WeakMap();
    }
    get(target: Replicable, key: string | Symbol): any {
        if (key === TargetSlot) {
            return target;
        } else if (key === MembraneSlot) {
            return this;
        }
        return this.handler.get(this, target, key);
    }
    set(target: Replicable, key: string | Symbol, newValue: any): boolean {
        return this.handler.set(this, target, key, newValue);
    }
    deleteProperty(target: Replicable, key: string | Symbol): boolean {
        if (key === TargetSlot) {
            return false;
        }
        return this.handler.deleteProperty(this, target, key);
    }
    apply(target: ReplicableFunction, thisArg: any, argumentsList: Array<any>): any {
        thisArg = unwrap(thisArg);
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.apply(this, target, thisArg, argumentsList);
    }
    construct(target: ReplicableFunction, argumentsList: Array<any>, newTarget: any): any {
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return this.handler.construct(this, target, argumentsList, newTarget);
    }
}

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
const { getKey } = Proxy;

export const unwrap = getKey ?
    (replicaOrAny: Replica | any): Replicable | any => (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny
    : (replicaOrAny: Replica | any): Replicable | any => (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;
