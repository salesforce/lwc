import assert from "./assert.js";
import {
    getOwnPropertyNames,
    defineProperty,
} from "./language.js";
import {
    scheduleRehydration,
} from "./vm.js";
import { markComponentAsDirty } from "./component.js";
const INTERNAL_VM = Symbol();

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
export function ClassList(vm: VM): DOMTokenList {
    assert.vm(vm);
    assert.isTrue(vm.cmpClasses === undefined, `${vm} should have undefined cmpClasses.`);
    vm.cmpClasses = {};
    defineProperty(this, INTERNAL_VM, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false,
    });
}

ClassList.prototype = {
    add(...classNames: Array<String>) {
        const vm = this[INTERNAL_VM];
        const { cmpClasses } = vm;
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
        classNames.forEach((className: String) => {
            className = className + '';
            if (!cmpClasses[className]) {
                cmpClasses[className] = true;
                console.log(`Marking ${vm} as dirty: classname "${className}" was added.`);
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log(`Scheduling ${vm} for rehydration due to changes in the classList collection.`);
                    scheduleRehydration(vm);
                }
            }
        });
    },
    remove(...classNames: Array<String>) {
        const vm = this[INTERNAL_VM];
        const { cmpClasses } = vm;
        // Remove specified class values.
        classNames.forEach((className: String) => {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                const vm = this[INTERNAL_VM];
                console.log(`Marking ${vm} as dirty: classname "${className}" was removed.`);
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log(`Scheduling ${vm} for rehydration due to changes in the classList collection.`);
                    scheduleRehydration(vm);
                }
            }
        });
    },
    item(index: Number): string | void {
        const vm = this[INTERNAL_VM];
        const { cmpClasses } = vm;
        // Return class value by index in collection.
        return getOwnPropertyNames(cmpClasses)
            .filter((className: string): boolean => cmpClasses[className + ''])[index] || null;
    },
    toggle(className: String, force: any): boolean {
        const vm = this[INTERNAL_VM];
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
        const vm = this[INTERNAL_VM];
        const { cmpClasses } = vm;
        // Checks if specified class value exists in class attribute of the element.
        return !!cmpClasses[className];
    },
    toString(): string {
        const vm = this[INTERNAL_VM];
        const { cmpClasses } = vm;
        return getOwnPropertyNames(cmpClasses).filter((className: string): boolean => cmpClasses[className + '']).join(' ');
    }
};
