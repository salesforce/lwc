// @flow

const ObjectToContextMap = new WeakMap();
const topLevelContextSymbol = Symbol('Top Level Context');

export let currentContext = {
    [topLevelContextSymbol]: true,
};

export function createNewContext(newContextObj: Object|null = {}): Object {
    currentContext = newContextObj;
    return currentContext;
}

export function setContext(obj: Object, context: Object) {
    if (DEVELOPMENT) {
        if (ObjectToContextMap.get(obj)) {
            throw new Error('A context already exist for ' + obj);
        }
    }
    ObjectToContextMap.set(obj, context);
}

export function getContext(obj: Object): Object {
    let ctx = ObjectToContextMap.get(obj);
    if (!ctx) {
        throw new Error('No context found for obj ' + obj);
    }
    return ctx;
}

export function establishContext(ctx: Object) {
    currentContext = ctx;
}
