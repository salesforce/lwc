// @flow

import * as baseAPI from "./api.js";

import dismounter from "./dismounter.js";

import patcher from "./patcher.js";

import {
    currentContext,
    establishContext,
} from "./context.js";

import vnode, {
    getElementDomNode,
} from "./vnode.js";

function createCtor(Ctor: Class): Class {
    // instances of this class will never be exposed to user-land
    return class Component extends vnode {
        constructor(attrs: Object, childRefs: Array<Object>) {
            super();
            this.api = this.createRenderInterface();
            this.isRendering = false;
            this.aboutToBeHydrated = false;
            this.component = null;
            this.offspring = null;
            attrs = Object.assign({}, attrs, { children: childRefs });
            this.name = Ctor.name;
            this.component = new Ctor(attrs);
            this.hasBodyAttribute = 'body' in this.component;
            this.wireTape();
        }

        set(attrName: string, attrValue: any) {
            if (this.isRendering) {
                throw new Error(`Invariant Violation: ${this.name}.render() method has side effects on the state of the component.`);
            }
            // TODO: process the attribute
            this.aboutToBeHydrated = true;
            this.component[attrName] = attrValue;
            this.aboutToBeHydrated = false;
        }

        toBeMounted() {
            super.toBeMounted();
            const newElement = this.invokeComponentRenderMethod();
            const oldElement = this.offspring;
            this.offspring = patcher(oldElement, newElement);
            this.domNode = getElementDomNode(this.offspring);
            this.invokeComponentAttachMethod();
        }

        toBeDismount() {
            super.toBeDismount();
            dismounter(this.offspring);
            this.invokeComponentDetachMethod();
        }

        toBeHydrated() {
            if (this.isMounted) {
                const newElement = this.invokeComponentRenderMethod();
                const oldElement = this.offspring;
                this.offspring = patcher(oldElement, newElement);
                const { domNode } = this;
                this.domNode = getElementDomNode(this.offspring);
                if (this.domNode !== domNode) {
                    domNode.parentNode.replaceChild(this.domNode, domNode);
                }
            }
        }

        invokeComponentDetachMethod() {
            if (this.component.detach) {
                const ctx = currentContext;
                establishContext(this);
                this.component.detach(this.domNode);
                establishContext(ctx);
            }
        }

        invokeComponentAttachMethod() {
            if (this.component.attach) {
                const ctx = currentContext;
                establishContext(this);
                this.component.attach(this.domNode);
                establishContext(ctx);
            }
        }

        invokeComponentRenderMethod(): Object {
            if (this.component.render) {
                const ctx = currentContext;
                establishContext(this);
                this.isRendering = true;
                const newElement = this.component.render(this.api);
                this.isRendering = false;
                establishContext(ctx);
                return newElement;
            }
            return null;
        }

        wireTape() {
            const { component } = this;
            // this decorator is responsible for adding setters and getters for all properties on
            // target as a way for users to apply mutations to their components and get the instance
            // rerendered
            Object.getOwnPropertyNames(component).forEach((propName: string) => {
                let { get, value, configurable, enumerable } = Object.getOwnPropertyDescriptor(component, propName);
                if (!get && configurable) {
                    Object.defineProperty(component, propName, {
                        get: (): any => value,
                        set: (newValue: any) => {
                            if (value !== newValue) {
                                value = newValue;
                                if (!this.aboutToBeHydrated) {
                                    Promise.resolve().then((): any => this.toBeHydrated());
                                }
                            }
                        },
                        configurable: false,
                        enumerable,
                    });
                }
            });
        }

        createRenderInterface(): Object {
            var cache = new Map();
            // this object wraps the static base api plus those bits that are bound to
            // the vnode instance, so we can apply memoization for some operations.
            return Object.create(baseAPI, {
                // [m]emoized node
                m: {
                    value: (key: number, value: any): any => {
                        if (cache.has(key)) {
                            return cache.get(key);
                        }
                        cache.set(key, value);
                        return value;
                    },
                    writable: false,
                    enumerable: true,
                }
            })
        }

    }
}

const ctorMap = new WeakMap();

export function factory(ComponentCtor: Class): Object {
    let Ctor = ctorMap.get(ComponentCtor);
    if (!Ctor) {
        Ctor = createCtor(ComponentCtor);
        ctorMap.set(ComponentCtor, Ctor);
    }
    return Ctor;
}
