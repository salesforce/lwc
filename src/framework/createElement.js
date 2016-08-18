import {
    currentContext,
    createNewContext,
    getContext,
    setContext,
    stablishContext,
} from "./context.js";

import {
    renderComponent,
} from "./rendering.js";

import HTMLComponentFactory from "./html-component-factory.js";

export function getRef(component, refId) {
    const ctx = getContext(component);
    return ctx.ref[refId];
}

function storeReferenceInContext(context, component, ref) {
    if (typeof ref !== 'string') {
        throw new Error(`Ref ${ref} should be a string value in component ${component}.`);
    }
    if (context.refs[ref]) {
        throw new Error(`Ref ${ref} already exists in owner of component ${component}.`);
    }
    context.refs[ref] = component;
}

function createEmptyComponentContextAndRestoreIt() {
     const context = createNewContext({
         ref: {},
         isMounted: false,
         isDirty: false,
         dirtyPropNames: {},
         tree: null,
     });
     stablishContext(context);
     return context;
}

export function isValidElement(obj) {
    if (obj === null) {
        return true;
    }
    // check if the element is an opaque element
    throw new Error('TBD', obj);
}

function createTextNodeElement(text) {
    throw new Error('TBD', text);
}

function createChildrenElements(children) {
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

export function createElement(ComponentClass, attrs = {}, children) {
    if (typeof ComponentClass === "string") {
        ComponentClass = HTMLComponentFactory(ComponentClass);
    }
    const ownerContext = currentContext;
    const config = Object.assign(attrs, {
        children: createChildrenElements(children),
    });
    const innerContext = createEmptyComponentContextAndRestoreIt();
    const component = new ComponentClass(config);
    if (attrs.__ref) {
        // keeping track of anything with ref within the current rendering process...
        storeReferenceInContext(ownerContext, component, attrs.__ref);
    }
    setContext(component, innerContext);
    renderComponent(component);
    stablishContext(ownerContext);
}
