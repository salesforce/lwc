import assert from "./assert";
import { OwnerKey } from "./vm";
import { ArrayMap, isArray, toString } from "./language";
import { Services } from "./services";

const GetTarget = Symbol('internal');

type ReplicableFunction = (...args: Array<any>) => any; // eslint-disable-line no-undef
export type Replicable = Object | ReplicableFunction;

type ReplicaFunction = (...args: Array<any>) => Replica | String | Number | Boolean; // eslint-disable-line no-undef
export type Replica = Object | ReplicaFunction;

function isReplicable(value: any): boolean {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}

function getTarget(membrane: Membrane, replicaOrAny: Replica | any): Replicable | any {
    assert.isTrue(membrane instanceof Membrane, `getTarget() first argument must be a membrane.`);
    if (isReplicable(replicaOrAny) && membrane.cache.has(replicaOrAny)) {
        return replicaOrAny[GetTarget];
    }
    return replicaOrAny;
}

export function getReplica(membrane: Membrane, value: Replicable | any): Replica | any {
    if (value === null || !isReplicable(value)) {
        return value;
    }
    assert.isTrue(membrane instanceof Membrane, `getReplica() first argument must be a membrane.`);
    let { cells, cache } = membrane;
    if (cache.has(value)) {
        return value;
    }
    const r = cells.get(value);
    if (r) {
        return r;
    }
    const replica: Replica = new Proxy(value, (membrane as ProxyHandler<Replicable>)); // eslint-disable-line no-undef
    cells.set(value, replica);
    cache.add(replica);
    return replica;
}

function piercingHook(vm: VM, target: Replicable, key: string | Symbol, value: any): any {
    assert.vm(vm);
    const { piercing } = Services;
    if (piercing) {
        const { component, vnode: { data }, def, context } = vm;
        let result = value;
        let next = true;
        const callback = (newValue?: any) => {
            next = false;
            result = newValue;
        };
        for (let i = 0, len = piercing.length; next && i < len; ++i) {
            piercing[i].call(undefined, component, data, def, context, target, key, value, callback);
        }
        return result;
    }
}

export class Membrane {
    vm: VM; // eslint-disable-line no-undef
    cells: WeakMap<Replicable, Replica>; // eslint-disable-line no-undef
    cache: WeakSet<Replica>; // eslint-disable-line no-undef
    constructor(vm: VM) {
        assert.vm(vm);
        this.vm = vm;
        this.cells = new WeakMap();
        this.cache = new WeakSet();
    }
    get(target: Replicable, key: string | Symbol): any {
        if (key === OwnerKey) {
            return undefined;
        }
        if (key === GetTarget) {
            return target;
        }
        let value = target[key];
        value = piercingHook(this.vm, target, key, value);
        return getReplica(this, value);
    }
    set(target: Replicable, key: string, newValue: any): boolean {
        assert.logError(`A protective membrane is preventing mutations to ${key} member property of ${toString(target)} to the value of ${toString(newValue)}.`);
        return false;
    }
    apply(targetFn: ReplicableFunction, thisArg: any, argumentsList: Array<any>): any {
        // TODO: argumentsList should be unwrap as well
        thisArg = getTarget(this, thisArg);
        argumentsList = getTarget(this, argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, (value: any): any => getTarget(this, value));
        }
        const value = targetFn.apply(thisArg, argumentsList);
        return getReplica(this, value);
    }
    pierce(value: Replicable | any): Replica | any {
        return getReplica(this, value);
    }
}
