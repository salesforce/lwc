// @flow

import * as baseAPI from "./api.js";
import { patch } from "./patcher.js";
import vnode, {
    getElementDomNode,
    scheduleRehydration,
} from "./vnode.js";
import { assert } from "./utils.js";
import { dismount } from "./dismounter.js";
import { initComponentAttributes } from "./attribute.js";
import { initComponentProperties } from "./property.js";
import {
    invokeComponentDetachMethod,
    invokeComponentAttachMethod,
    invokeComponentRenderMethod,
    invokeComponentUpdatedMethod,
} from "./invoker.js";

function createCtor(Ctor: Class): Class {
    // instances of this class will never be exposed to user-land
    return class Component extends vnode {
        isRendering = false;
        hasBodyAttribute = false;
        component = null;
        offspring = null;
        static vnodeType = Ctor.name;

        constructor(attrs: Object, childRefs: Array<Object>) {
            super();
            this.api = this.createRenderInterface();
            this.attrs = attrs;
            this.component = new Ctor();
            initComponentAttributes(this, attrs, childRefs);
            initComponentProperties(this);
            invokeComponentUpdatedMethod(this);
            this.isReady = true;
        }

        set(attrName: string, attrValue: any) {
            if (this.isRendering) {
                throw new Error(`Invariant Violation: ${this}.render() method has side effects on the state of the component.`);
            }
            this.attrs[attrName] = attrValue;
            scheduleRehydration(this);
        }

        toBeMounted() {
            super.toBeMounted();
            const newElement = invokeComponentRenderMethod(this);
            const oldElement = this.offspring;
            this.offspring = patch(oldElement, newElement);
            this.domNode = getElementDomNode(this.offspring);
            invokeComponentAttachMethod(this);
        }

        toBeDismount() {
            super.toBeDismount();
            dismount(this.offspring);
            invokeComponentDetachMethod(this);
        }

        toBeHydrated() {
            const { isMounted, isScheduled } = this;
            if (isMounted) {
                assert(isScheduled, `Invariant: Arbitrary call to ${this}.toBeHydrated()`);
                invokeComponentUpdatedMethod(this);
                const newElement = invokeComponentRenderMethod(this);
                const oldElement = this.offspring;
                this.offspring = patch(oldElement, newElement);
                const { domNode } = this;
                this.domNode = getElementDomNode(this.offspring);
                if (this.domNode !== domNode) {
                    domNode.parentNode.replaceChild(this.domNode, domNode);
                }
                this.isScheduled = false;
            }
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
