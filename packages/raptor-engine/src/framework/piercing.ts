import assert from "./assert";
import { OwnerKey } from "./vm";
import { Services } from "./services";
import { getReplica, Membrane } from "./membrane";

/* eslint-disable */
import { Replicable, ReplicableFunction, MembraneHandler } from "./membrane";
/* eslint-enable */

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

export class PiercingMembraneHandler implements MembraneHandler {
    vm: VM; // eslint-disable-line no-undef
    constructor(vm: VM) {
        assert.vm(vm);
        this.vm = vm;
    }
    get(target: Replicable, key: string | Symbol): any {
        if (key === OwnerKey) {
            return undefined;
        }
        let value = target[key];
        return piercingHook(this.vm, target, key, value);
    }
    set(target: Replicable, key: string, newValue: any): boolean {
        target[key] = newValue;
        return true;
    }
    deleteProperty(target: Replicable, key: string | Symbol): boolean {
        delete target[key];
        return true;
    }
    apply(targetFn: ReplicableFunction, thisArg: any, argumentsList: Array<any>): any {
        return targetFn.apply(thisArg, argumentsList);
    }
    construct(targetFn: ReplicableFunction, argumentsList: Array<any>, newTarget: any): any {
        assert.isTrue(newTarget, `construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.`);
        return new targetFn(...argumentsList);
    }
}

export function pierce(vm: VM, value: Replicable | any): any {
    assert.vm(vm);
    let { membrane } = vm;
    if (!membrane) {
        const handler = new PiercingMembraneHandler(vm);
        membrane = new Membrane(handler);
        vm.membrane = membrane;
    }
    return getReplica(membrane, value);
}
