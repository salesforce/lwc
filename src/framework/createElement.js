// @flow

import {
    currentContext,
    createNewContext,
    getContext,
    setContext,
    establishContext,
} from "./context.js";

import live from "./decorator/live.js";

import HTMLComponentFactory from "./html-component-factory.js";

export const opaqueToComponentMap = new WeakMap();

export function getRef(component: Object, refId: string): any {
    const ctx = getContext(component);
    return ctx.refs[refId];
}

function storeReferenceInContext(context: Object, component: Object, ref: string) {
    if (typeof ref !== 'string') {
        throw new Error(`Ref ${ref} should be a string value in component ${component}.`);
    }
    if (!context || !context.refs) {
        return; // ignoring top level calls, not need to track them
    }
    if (context.refs[ref]) {
        console.log(`Ref ${ref} is being replaced with with component ${component} in ${context.name}.`);
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

function createChildrenElements(children: Array<any>): Array<any> {
    if (!Array.isArray(children)) {
        throw new Error(`The 3rd argument of createElement() should be an array instead of ${children}.`);
    }
    const elements = [];
    const len = children.length;
    let i = 0;
    for (i; i < len; i += 1) {
        let opaque = children[i];
        if (typeof opaque === 'object' && opaque !== null && !opaqueToComponentMap.has(opaque)) {
            throw new Error(`Invalid children ${opaque}.`);
        }
        elements[i] = opaque;
    }
    return elements;
}

export function createElement(ComponentClass: any, attrs: any = {}, children: Array<any> = []): Object {
    // TODO: validate if it is a valid tag
    const isHTMLTagName = typeof ComponentClass === "string";
    if (isHTMLTagName) {
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
    // attempting to decorate the component to be a live component
    if (!isHTMLTagName) {
        live(component);
    }
    if (DEVELOPMENT) {
        opaque.__component__ = component;
    }

    // returning the opaque element
    return opaque;
}
