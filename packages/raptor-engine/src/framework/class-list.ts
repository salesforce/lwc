import assert from "./assert";
import {
    getOwnPropertyNames,
    defineProperty,
    isUndefined,
    forEach,
} from "./language";

import { ViewModelReflection } from "./def";

function getLinkedElement(classList: ClassList): HTMLElement {
    return classList[ViewModelReflection].vnode.elm;
}

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
export function ClassList(vm: VM): DOMTokenList {
    assert.vm(vm);
    defineProperty(this, ViewModelReflection, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}

ClassList.prototype = {
    add() {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        const elm = getLinkedElement(this);
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
        forEach.call(arguments, (className: String) => {
            className = className + '';
            if (!cmpClasses[className]) {
                cmpClasses[className] = true;
                // this is not only an optimization, it is also needed to avoid adding the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx) {
                    // we intentionally make a sync mutation here and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    elm.classList.add(className);
                }
            }
        });
    },
    remove() {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        const elm = getLinkedElement(this);
        // Remove specified class values.
        forEach.call(arguments, (className: String) => {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                // this is not only an optimization, it is also needed to avoid removing the same
                // class twice when the initial diffing algo kicks in without an old vm to track
                // what was already added to the DOM.
                if (vm.idx) {
                    // we intentionally make a sync mutation here when needed and also keep track of the mutation
                    // for a possible rehydration later on without having to rehydrate just now.
                    const ownerClass = vm.vnode.data.class;
                    // This is only needed if the owner is not forcing that class to be present in case of conflicts.
                    if (isUndefined(ownerClass) || !ownerClass[className]) {
                        elm.classList.remove(className);
                    }
                }
            }
        });
    },
    item(index: Number): string | void {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        // Return class value by index in collection.
        return getOwnPropertyNames(cmpClasses)
            .filter((className: string): boolean => cmpClasses[className + ''])[index] || null;
    },
    toggle(className: String, force: any): boolean {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        // When only one argument is present: Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and return true.
        // When a second argument is present: If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
        if (arguments.length > 1) {
            if (force) {
                this.add(className);
            } else if (!force) {
                this.remove(className);
            }
            return !!force;
        }
        if (cmpClasses[className]) {
            this.remove(className);
            return false;
        }
        this.add(className);
        return true;
    },
    contains(className: String): boolean {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        // Checks if specified class value exists in class attribute of the element.
        return !!cmpClasses[className];
    },
    toString(): string {
        const vm = this[ViewModelReflection];
        const { cmpClasses } = vm;
        return getOwnPropertyNames(cmpClasses).filter((className: string): boolean => cmpClasses[className + '']).join(' ');
    }
};
