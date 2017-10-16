import { isReplicable } from './shared';
import { MembraneHandler } from './membrane-handler';
import {
    isArray,
    isObject,
    isFunction,
} from './shared';

/*eslint-disable*/
type ReplicableFunction = (...args: Array<any>) => any;
type Replicable = Object | ReplicableFunction;

type ReplicaFunction = (...args: Array<any>) => Replica | String | Number | Boolean | null | undefined;
type Replica = Object | ReplicaFunction;
type MembraneShadowTarget = Object | Array<any> | Function;

type DistortionHandler = (membrane: Membrane, value: any) => any;

interface CompatProxy extends ProxyConstructor {
    getKey?: (target: any, key: PropertyKey) => any
}
/*eslint-enable*/
import { OriginalTargetSlot } from './shared';

const MembraneMap: WeakMap<any, any> = new WeakMap();

function createShadowTarget(value: any): MembraneShadowTarget {
    let shadowTarget: MembraneShadowTarget | undefined = undefined;
    if (isArray(value)) {
        shadowTarget = [];
    } else if (isObject(value)) {
        shadowTarget = {};
    } else if (isFunction(value)) {
        shadowTarget = function () {}
    }
    return shadowTarget as MembraneShadowTarget;
}

const { getKey } = Proxy as CompatProxy;

export const unwrap = getKey ?
    (replicaOrAny: Replica | any): Replicable | any => (replicaOrAny && getKey(replicaOrAny, OriginalTargetSlot)) || replicaOrAny
    : (replicaOrAny: Replica | any): Replicable | any => (replicaOrAny && replicaOrAny[OriginalTargetSlot]) || replicaOrAny;

export function invokeDistortion(membrane: Membrane, value: any): any {
    const { distortion } = membrane;
    return distortion(membrane, unwrap(value));
}

function wrap(membrane: Membrane, originalTarget: Replicable) {
    let proxy = MembraneMap.get(originalTarget);
    if (proxy !== undefined) {
        return proxy;
    }
    const shadowTarget = createShadowTarget(originalTarget);
    const handler = new MembraneHandler(membrane, originalTarget);
    proxy = new Proxy(shadowTarget, handler); // eslint-disable-line no-undef
    MembraneMap.set(originalTarget, proxy);
    return proxy;
}

export class Membrane {
    distortion: DistortionHandler; // eslint-disable-line no-undef
    constructor (distortion: DistortionHandler) {
        this.distortion = distortion;
    }
    inject(value: Replicable): any {
        if (isReplicable(value)) {
            return wrap(this, unwrap(value));
        }
        return value;
    }
}
