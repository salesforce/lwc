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

type DistortionHandler = (value: any) => any;
/*eslint-enable*/
import { TargetSlot } from './shared';

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

export function invokeDistortion(membrane: Membrane, value: any): any {
    const { distortion } = membrane;
    const distorted = distortion(unwrap(value));
    return isReplicable(distorted) ? wrap(membrane, distorted) : distorted;
}

export function unwrap(replicaOrAny: Replica | any): Replicable | any {
    return (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;
}

function wrap(membrane: Membrane, value: Replicable) {
    let proxy = MembraneMap.get(value);
    if (proxy) {
        return proxy;
    }
    const shadowTarget = createShadowTarget(value);
    const handler = new MembraneHandler(membrane, value);
    proxy = new Proxy(shadowTarget, handler); // eslint-disable-line no-undef
    MembraneMap.set(value, proxy);
    return proxy;
}

export class Membrane {
    distortion: DistortionHandler; // eslint-disable-line no-undef
    constructor (distortion: DistortionHandler) {
        this.distortion = distortion;
    }
    inject(value: Replicable): any {
        return invokeDistortion(this, value);
    }
}
