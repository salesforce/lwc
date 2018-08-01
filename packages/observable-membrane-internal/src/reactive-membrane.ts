import {
    ObjectCreate,
    ObjectDefineProperties,
    ObjectDefineProperty,
    unwrap,
    isArray,
    isObservable,
    isObject,
} from './shared';
import { ReactiveProxyHandler } from './reactive-handler';
import { ReadOnlyHandler } from './read-only-handler';
import { init as initDevFormatter } from './reactive-dev-formatter';

if (process.env.NODE_ENV !== 'production') {
    initDevFormatter();
}

export interface ReactiveState {
    readOnly: any;
    reactive: any;
    shadowTarget: ReactiveMembraneShadowTarget;
}

export type ReactiveMembraneShadowTarget = Object | any[];
export type ReactiveMembraneEventHander = (obj: any, key: PropertyKey) => void;
export type ReactiveMembraneDistortionCallback = (value: any) => any;

export interface ReactiveMembraneEventHandlerMap {
    propertyMemberChange: ReactiveMembraneEventHander;
    propertyMemberAccess: ReactiveMembraneEventHander;
    [key: string]: ReactiveMembraneEventHander;
}

function invokeDistortion(membrane: ReactiveMembrane, value: any): { value: any, observable: boolean } {
    return membrane.distortion(value);
}

function createShadowTarget(value: any): ReactiveMembraneShadowTarget {
    let shadowTarget: ReactiveMembraneShadowTarget | undefined = undefined;
    if (isArray(value)) {
        shadowTarget = [];
    } else if (isObject(value)) {
        shadowTarget = {};
    }
    return shadowTarget as ReactiveMembraneShadowTarget;
}

function getReactiveState(membrane: ReactiveMembrane, value: any): ReactiveState {
    const { objectGraph } = membrane;
    value = unwrap(value);
    let reactiveState = objectGraph.get(value);
    if (reactiveState) {
        return reactiveState;
    }

    reactiveState = ObjectDefineProperties(ObjectCreate(null), {
        reactive: {
            get(this: ReactiveState) {
                const reactiveHandler = new ReactiveProxyHandler(membrane, value);
                const proxy = new Proxy(createShadowTarget(value), reactiveHandler);
                ObjectDefineProperty(this, 'reactive', { value: proxy });
                return proxy;
            },
            configurable: true,
        },
        readOnly: {
            get(this: ReactiveState) {
                const readOnlyHandler = new ReadOnlyHandler(membrane, value);
                const proxy = new Proxy(createShadowTarget(value), readOnlyHandler);
                ObjectDefineProperty(this, 'readOnly', { value: proxy });
                return proxy;
            },
            configurable: true,
        }
    }) as ReactiveState;

    objectGraph.set(value, reactiveState);
    return reactiveState;
}

export function notifyMutation(membrane: ReactiveMembrane, obj: any, key: PropertyKey) {
    membrane.propertyMemberChange(obj, key);
}

export function observeMutation(membrane: ReactiveMembrane, obj: any, key: PropertyKey) {
    membrane.propertyMemberAccess(obj, key);
}

export class ReactiveMembrane {
    distortion: ReactiveMembraneDistortionCallback;
    propertyMemberChange: ReactiveMembraneEventHander;
    propertyMemberAccess: ReactiveMembraneEventHander;
    objectGraph: WeakMap<any, ReactiveState> = new WeakMap();
    constructor(distortion: ReactiveMembraneDistortionCallback, eventMap: ReactiveMembraneEventHandlerMap) {
        this.distortion = distortion;
        this.propertyMemberChange = eventMap.propertyMemberChange;
        this.propertyMemberAccess = eventMap.propertyMemberAccess;
    }

    getProxy(value: any) {
        const distorted = invokeDistortion(this, value);
        if (isObservable(distorted)) {
            const o = getReactiveState(this, distorted);
            // when trying to extract the writable version of a readonly
            // we return the readonly.
            return o.readOnly === value ? value : o.reactive;
        }
        return distorted;
    }

    getReadOnlyProxy(value: any) {
        const distorted = invokeDistortion(this, value);
        if (isObservable(distorted)) {
            return getReactiveState(this, distorted).readOnly;
        }
        return distorted;
    }
}

export { unwrap };
