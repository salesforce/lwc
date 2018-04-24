import assert from "./assert";
import { OwnerKey, VM } from "./vm";
import { Services } from "./services";
import { getReplica, Membrane, Replicable, ReplicableFunction, MembraneHandler } from "./membrane";

export function piercingHook(membrane: Membrane, target: Replicable, key: PropertyKey, value: any): any {
    const { vm } = membrane.handler as PiercingMembraneHandler;
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { piercing } = Services;
    if (piercing) {
        const { component, data, def, context } = vm;
        let result = value;
        let next = true;
        const callback = (newValue?: any) => {
            next = false;
            result = newValue;
        };
        for (let i = 0, len = piercing.length; next && i < len; ++i) {
            piercing[i].call(undefined, component, data, def, context, target, key, value, callback);
        }
        return result === value ? getReplica(membrane, result) : result;
    }
}

export class PiercingMembraneHandler implements MembraneHandler {
    vm: VM;
    constructor(vm: VM) {
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        this.vm = vm;
    }
    get(membrane: Membrane, target: Replicable, key: PropertyKey): any {
        if (key === OwnerKey) {
            return undefined;
        }
        const value = target[key];
        return piercingHook(membrane, target, key, value);
    }
    set(membrane: Membrane, target: Replicable, key: string, newValue: any): boolean {
        target[key] = newValue;
        return true;
    }
    deleteProperty(membrane: Membrane, target: Replicable, key: PropertyKey): boolean {
        delete target[key];
        return true;
    }
    apply(membrane: Membrane, targetFn: ReplicableFunction, thisArg: any, argumentsList: any[]): any {
        return getReplica(membrane, targetFn.apply(thisArg, argumentsList));
    }
    construct(membrane: Membrane, targetFn: ReplicableFunction, argumentsList: any[], newTarget: any): any {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(newTarget, `construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.`);
        }
        return getReplica(membrane, new targetFn(...argumentsList));
    }
}

export function pierce(vm: VM, value: Replicable | any): any {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    let { membrane } = vm;
    if (!membrane) {
        const handler = new PiercingMembraneHandler(vm);
        membrane = new Membrane(handler);
        vm.membrane = membrane;
    }
    return getReplica(membrane, value);
}
