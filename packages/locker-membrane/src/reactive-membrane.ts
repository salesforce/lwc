import { unwrap, isArray, isObservable, isObject, logWarning, isNull } from './shared';
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

type ReactiveMembraneEventHander = (obj: any, key: PropertyKey) => void;
type ReactiveMembraneDistortionCallback = (value: any) => any;

interface IReactiveMembraneEventHandlerMap {
    propertyMemberChange: ReactiveMembraneEventHander;
    propertyMemberAccess: ReactiveMembraneEventHander;
    [key: string]: ReactiveMembraneEventHander;
}


function invokeDistortion(membrane: ReactiveMembrane, value: any): { value: any, observable: boolean } {
    const distorted = membrane.distortion(value);
    const observable = isObservable(distorted);

    if (process.env.NODE_ENV !== 'production') {
        if (!isObservable && !isNull(distorted) && isObject(distorted)) {
            logWarning(`Assigning a non-reactive value ${distorted} to reactive membrane is not common because mutations on that value cannot be observed.`);
        }
    }

    return {
        value: distorted,
        observable,
    };
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
    const shadowTarget = isArray(value) ? [] : {};
    reactiveState = {
        reactive: new Proxy(shadowTarget, reactiveHandler),
        readOnly: new Proxy(shadowTarget, readOnlyHandler),
    }
    objectGraph.set(value, reactiveState);
    return reactiveState;
}

export function notifyMutation(membrane: ReactiveMembrane, obj: any, key: PropertyKey) {
    membrane.eventMap.propertyMemberChange(obj, key);
}

export function observeMutation(membrane: ReactiveMembrane, obj: any, key: PropertyKey) {
    membrane.eventMap.propertyMemberAccess(obj, key);
}

export class ReactiveMembrane {
    distortion: ReactiveMembraneDistortionCallback;
    eventMap: IReactiveMembraneEventHandlerMap;
    objectGraph: WeakMap<any, IReactiveState> = new WeakMap();
    constructor (distrotion: ReactiveMembraneDistortionCallback, eventMap: IReactiveMembraneEventHandlerMap) {
        this.distortion = distrotion;
        this.eventMap = eventMap;
    }

    getReactiveProxy(value: any) {
        const { value: distorted, observable: distoredIsObservable } = invokeDistortion(this, value);
        if (distoredIsObservable) {
            return getReactiveState(this, distorted).reactive;
        }
        return value;
    }

    getReadOnlyProxy(value: any) {
        const { value: distorted, observable: distoredIsObservable } = invokeDistortion(this, value);
        if (distoredIsObservable) {
            return getReactiveState(this, distorted).readOnly;
        }
        return value;
    }
}

export { unwrap }