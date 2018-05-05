import assert from "./assert";
import { OwnerKey } from "./vm";
import { Services } from "./services";
import { getReplica, Membrane, Replicable, ReplicableFunction } from "./membrane";
import { isUndefined } from "./language";

function piercingHook(membrane: Membrane, target: Replicable, key: PropertyKey, value: any): any {
    const { piercing } = Services;
    if (piercing) {
        let result = value;
        let next = true;
        const callback = (newValue?: any) => {
            next = false;
            result = newValue;
        };
        for (let i = 0, len = piercing.length; next && i < len; ++i) {
            piercing[i].call(undefined, target, key, value, callback);
        }
        return result === value ? getReplica(membrane, result) : result;
    }
}

let piercingMembrane: Membrane;

function createPiercingMembrane() {
    return new Membrane({
        get(membrane: Membrane, target: Replicable, key: PropertyKey): any {
            if (key === OwnerKey) {
                return undefined;
            }
            const value = target[key];
            return piercingHook(membrane, target, key, value);
        },
        set(membrane: Membrane, target: Replicable, key: string, newValue: any): boolean {
            target[key] = newValue;
            return true;
        },
        deleteProperty(membrane: Membrane, target: Replicable, key: PropertyKey): boolean {
            delete target[key];
            return true;
        },
        apply(membrane: Membrane, targetFn: ReplicableFunction, thisArg: any, argumentsList: any[]): any {
            return getReplica(membrane, targetFn.apply(thisArg, argumentsList));
        },
        construct(membrane: Membrane, targetFn: ReplicableFunction, argumentsList: any[], newTarget: any): any {
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(newTarget, `construct handler expects a 3rd argument with a newly created object that will be ignored in favor of the wrapped constructor.`);
            }
            return getReplica(membrane, new targetFn(...argumentsList));
        },
    });
}

export function pierce(value: Replicable | any): any {
    if (isUndefined(piercingMembrane)) {
        piercingMembrane = createPiercingMembrane();
    }
    return getReplica(piercingMembrane, value);
}
