import { unwrap, isArray, isObservable } from './shared';
import { ReactiveProxyHandler } from './reactive-handler';
import { ReadOnlyHandler } from './read-only-handler';

interface IReactiveState {
    readOnly: any;
    reactive: any;
}

type ReactiveMembraneEventHander = (obj: any, key: PropertyKey) => void;

interface IReactiveMembraneEventHandlerMap {
    propertyMemberChange: ReactiveMembraneEventHander;
    propertyMemberAccess: ReactiveMembraneEventHander;
    [key: string]: ReactiveMembraneEventHander;
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
    eventMap: IReactiveMembraneEventHandlerMap;
    objectGraph: WeakMap<any, IReactiveState> = new WeakMap();
    constructor (eventMap: IReactiveMembraneEventHandlerMap) {
        this.eventMap = eventMap;
    }

    getReactiveProxy(value: any) {
        if (isObservable(value)) {
            return getReactiveState(this, value).reactive;
        }
        return value;
    }

    getReadOnlyProxy(value: any) {
        if (isObservable(value)) {
            return getReactiveState(this, value).readOnly;
        }
        return value;
    }
}