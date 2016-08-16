export const ComponentToContextMap = new WeakMap();
export let currentContext;

export function createNewContext(component) {
    if (ComponentToContextMap.get(component)) {
        throw new Error('A context already exist for component ' + component);
    }
    currentContext = {};
    ComponentToContextMap.set(component, currentContext);
}

export function getContext(component) {
    let ctx = ComponentToContextMap.get(component);
    if (!ctx) {
        throw new Error('No context found for component ' + component);
    }
    return ctx;
}

export function restoreContext(component) {
    let ctx = ComponentToContextMap.get(component);
    if (!ctx) {
        throw new Error('No context found for component ' + component);
    }
    currentContext = ctx;
}
