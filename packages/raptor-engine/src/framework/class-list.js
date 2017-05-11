import assert from "./assert.js";
import {
    getOwnPropertyNames,
    defineProperty,
} from "./language.js";

import { ViewModelReflection, Element } from "./html-element.js";

const INTERNAL_CMP = Symbol('internal');
const INTERNAL_DATA = Symbol('internal');

function getLinkedElement(classList: ClassList): HTMLElement {
    return classList[INTERNAL_CMP][ViewModelReflection].vnode.elm;
}

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
export function ClassList(component: Component, cmpClasses: HashTable<Boolean>): DOMTokenList {
    assert.isTrue(component instanceof Element, `${component} must be an instance of Element.`);
    assert.isTrue(typeof component === 'object', `${cmpClasses} should be an object.`);
    defineProperty(this, INTERNAL_CMP, {
        value: component,
        writable: false,
        enumerable: false,
        configurable: false,
    });
    defineProperty(this, INTERNAL_DATA, {
        value: cmpClasses,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}

ClassList.prototype = {
    add(...classNames: Array<String>) {
        const cmpClasses = this[INTERNAL_DATA];
        const elm = getLinkedElement(this);
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
        classNames.forEach((className: String) => {
            className = className + '';
            if (!cmpClasses[className]) {
                cmpClasses[className] = true;
                // we intentionally make a sync mutation here and also keep track of the mutation
                // for a possible rehydration later on without having to rehydrate just now.
                elm.classList.add(className);
            }
        });
    },
    remove(...classNames: Array<String>) {
        const cmpClasses = this[INTERNAL_DATA];
        const elm = getLinkedElement(this);
        // Remove specified class values.
        classNames.forEach((className: String) => {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                // we intentionally make a sync mutation here and also keep track of the mutation
                // for a possible rehydration later on without having to rehydrate just now.
                elm.classList.remove(className);
            }
        });
    },
    item(index: Number): string | void {
        const cmpClasses = this[INTERNAL_DATA];
        // Return class value by index in collection.
        return getOwnPropertyNames(cmpClasses)
            .filter((className: string): boolean => cmpClasses[className + ''])[index] || null;
    },
    toggle(className: String, force: any): boolean {
        const cmpClasses = this[INTERNAL_DATA];
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
        const cmpClasses = this[INTERNAL_DATA];
        // Checks if specified class value exists in class attribute of the element.
        return !!cmpClasses[className];
    },
    toString(): string {
        const cmpClasses = this[INTERNAL_DATA];
        return getOwnPropertyNames(cmpClasses).filter((className: string): boolean => cmpClasses[className + '']).join(' ');
    }
};
