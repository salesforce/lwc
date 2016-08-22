// @flow

import {
    currentContext,
    createNewContext,
    getContext,
    setContext,
    establishContext,
} from "./context.js";

import HTMLComponentFactory from "./html-component-factory.js";

export const opaqueToComponentMap = new WeakMap();

export function getRef(component: Object, refId: string): any {
    const ctx = getContext(component);
    return ctx.ref[refId];
}

function storeReferenceInContext(context: Object, component: Object, ref: string) {
    if (typeof ref !== 'string') {
        throw new Error(`Ref ${ref} should be a string value in component ${component}.`);
    }
    if (!context || !context.refs) {
        return; // ignoring top level calls, not need to track them
    }
    if (context.refs[ref]) {
        throw new Error(`Ref ${ref} already exists in owner of component ${component}.`);
    }
    context.refs[ref] = component;
}

function createEmptyComponentContextAndEstablishIt(name: string): Object {
     const context = createNewContext({
         refs: {},
         name,
         isMounted: false,
         isDirty: false,
         isUpdating: false,
         isRendered: false,
         dirtyPropNames: Object.create(null),
         childComponent: null,
         tree: null,
     });
     establishContext(context);
     return context;
}

export function isValidElement(opaque: any): boolean {
    if (opaque === null) {
        return true;
    }
    // check if the element is an opaque element
    return opaqueToComponentMap.has(opaque);
}

function createTextNodeElement(text: string) {
    throw new Error('TBD', text);
}

function createChildrenElements(children: Array<any>): Array<any> {
    if (!Array.isArray(children)) {
        throw new Error(`The 3rd argument of createElement() should be an array instead of ${children}.`);
    }
    const elements = [];
    for (let obj in children) {
        if (typeof obj === 'string') {
            elements.push(createTextNodeElement(obj));
        } else if (isValidElement(obj)) {
            elements.push(obj);
        } else {
            throw new Error(`Invalid children ${obj}.`);
        }
    }
    return elements;
}

export function createElement(ComponentClass: any, attrs: any = {}, children: Array<any> = []): Object {
    if (typeof ComponentClass === "string") {
        ComponentClass = HTMLComponentFactory(ComponentClass);
    }
    const ownerContext = currentContext;
    const config = Object.assign(attrs, {
        children: createChildrenElements(children),
    });
    const innerContext = createEmptyComponentContextAndEstablishIt(ComponentClass.name);
    const component = new ComponentClass(config);
    if (attrs.__ref) {
        // keeping track of anything with ref within the current rendering process...
        storeReferenceInContext(ownerContext, component, attrs.__ref);
    }
    setContext(component, innerContext);
    establishContext(ownerContext);
    const opaque = {};
    opaqueToComponentMap.set(opaque, component);
    // for debugging only:
    opaque.__component__ = component;
    // returning the opaque element
    return opaque;
}
