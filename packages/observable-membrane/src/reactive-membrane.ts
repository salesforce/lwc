import { unwrap, isArray, isObservable, isObject, logWarning, isNull, isFunction } from './shared';
import { ReactiveProxyHandler } from './reactive-handler';
import { ReadOnlyHandler } from './read-only-handler';
import { init as initDevFormatter } from './reactive-dev-formatter';

if (process.env.NODE_ENV !== 'production') {
    initDevFormatter();
}

interface IReactiveState {
    readOnly: any;
    reactive: any;
}

export type ReactiveMembraneShadowTarget = Object | Array<any> | Function;
type ReactiveMembraneEventHander = (obj: any, key: PropertyKey) => void;
type ReactiveMembraneDistortionCallback = (value: any) => any;

interface IReactiveMembraneEventHandlerMap {
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
    } else if (isFunction(value)) {
        shadowTarget = function () {}
    }
    return shadowTarget as ReactiveMembraneShadowTarget;
}


function getReactiveState(membrane: ReactiveMembrane, value: any): IReactiveState {
    const { objectGraph } = membrane;
    value = unwrap(value);
    let reactiveState = objectGraph.get(value);
    if (reactiveState) {
        return reactiveState;
    }
    const reactiveHandler = new ReactiveProxyHandler(membrane, value);
    const readOnlyHandler = new ReadOnlyHandler(membrane, value);
    const shadowTarget = createShadowTarget(value);
    reactiveState = {
        reactive: new Proxy(shadowTarget, reactiveHandler),
        readOnly: new Proxy(shadowTarget, readOnlyHandler),
    }
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
    objectGraph: WeakMap<any, IReactiveState> = new WeakMap();
    constructor (distrotion: ReactiveMembraneDistortionCallback, eventMap: IReactiveMembraneEventHandlerMap) {
        this.distortion = distrotion;
        this.propertyMemberChange = eventMap.propertyMemberChange;
        this.propertyMemberAccess = eventMap.propertyMemberAccess;
    }

    getProxy(value: any) {
        const distorted = invokeDistortion(this, value);
        if (isObservable(distorted)) {
            return getReactiveState(this, distorted).reactive;
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

export { unwrap }