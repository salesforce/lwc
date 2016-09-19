// @flow

import * as baseAPI from "./api.js";
import { patch } from "./patcher.js";
import vnode, { getElementDomNode } from "./vnode.js";
import { dismount } from "./dismounter.js";
import {
    memoizerDescriptorFactory,
    pinch,
} from "./watcher.js";
import {
    invokeComponentDetachMethod,
    invokeComponentAttachMethod,
    invokeComponentRenderMethod,
    invokeComponentUpdatedMethod,
} from "./invoker.js";

function createCtor(Ctor: Class): Class {
    // instances of this class will never be exposed to user-land
    return class Component extends vnode {

        static vnodeType = Ctor.name;

        constructor(attrs: Object, childRefs: Array<Object>) {
            super();
            this.api = this.createRenderInterface();
            this.isRendering = false;
            this.isUpdating = false;
            this.aboutToBeHydrated = false;
            this.component = null;
            this.offspring = null;
            attrs = Object.assign({}, attrs, { children: childRefs });
            this.component = new Ctor(attrs);
            // TODO: formal verification that body is an attribute is needed
            this.hasBodyAttribute = 'body' in this.component;
            // setting all the initial values
            for (let attrName in attrs) {
                this.set(attrName, attrs[attrName]);
            }
            invokeComponentUpdatedMethod(this);
            pinch(this);
        }

        set(attrName: string, attrValue: any) {
            if (this.isRendering) {
                throw new Error(`Invariant Violation: ${this}.render() method has side effects on the state of the component.`);
            }
            if (this.isUpdating) {
                throw new Error(`Invariant Violation: Setting attribute ${this}.${attrName} has side effects on the state of the component.`);
            }
            // TODO: process the attribute
            this.isUpdating = true;
            this.component[attrName] = attrValue;
            this.isUpdating = false;
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
            if (this.isMounted && this.aboutToBeHydrated) {
                invokeComponentUpdatedMethod(this);
                this.aboutToBeHydrated = false;
                const newElement = invokeComponentRenderMethod(this);
                const oldElement = this.offspring;
                this.offspring = patch(oldElement, newElement);
                const { domNode } = this;
                this.domNode = getElementDomNode(this.offspring);
                if (this.domNode !== domNode) {
                    domNode.parentNode.replaceChild(this.domNode, domNode);
                }
            }
        }

        createRenderInterface(): Object {
            // this object wraps the static base api plus those bits that are bound to
            // the vnode instance, so we can apply memoization for some operations.
            return Object.create(baseAPI, {
                // [m]emoized node
                m: memoizerDescriptorFactory()
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
