import assert from "./assert.js";
import {
    resetComponentProp,
    updateComponentProp,
} from "./component.js";
import {
    scheduleRehydration,
    getLinkedVNode,
} from "./vm.js";

const INTERNAL_VM = Symbol();
const INTERNAL_LIST = Symbol();

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
export class ClassList {
    constructor(component: Component) {
        const { vm } = getLinkedVNode(component);
        assert.vm(vm);
        this[INTERNAL_VM] = vm;
        this[INTERNAL_LIST] = [];
    }
    add(...classNames: Array<String>) {
        const list = this[INTERNAL_LIST]
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.
        classNames.forEach((className: String) => {
            const pos = list.indexOf(className);
            if (pos === -1) {
                list.push(className);
                let vm = this[INTERNAL_VM];
                updateComponentProp(vm, 'className', list.join(' '));
                if (vm.isDirty) {
                    console.log(`Scheduling ${vm} for rehydration.`);
                    scheduleRehydration(vm);
                }
            }
        });
    }
    remove(...classNames: Array<String>) {
        const list = this[INTERNAL_LIST]
        // Remove specified class values.
        classNames.forEach((className: String) => {
            const pos = list.indexOf(className);
            if (pos >= 0) {
                list.splice(pos, 1);
                let vm = this[INTERNAL_VM];
                if (list.length) {
                    updateComponentProp(vm, 'className', list.join(' '));
                } else {
                    resetComponentProp(vm, 'className');
                }
                if (vm.isDirty) {
                    console.log(`Scheduling ${vm} for rehydration.`);
                    scheduleRehydration(vm);
                }
            }
        });
    }
    item(index: Number): string | void {
        const list = this[INTERNAL_LIST]
        // Return class value by index in collection.
        return list[index] || null;
    }
    toggle(className: String, force: any): boolean {
        const list = this[INTERNAL_LIST]
        // When only one argument is present: Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and return true.
        const pos = list.indexOf(className);
        // When a second argument is present: If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
        if (arguments.length > 1) {
            if (force && pos === -1) {
                this.add(className);
            } else if (!force && pos >= 0) {
                this.remove(className);
            }
            return !!force;
        }
        if (pos) {
            this.remove(className);
            return false;
        }
        this.add(className);
        return true;
    }
    contains(className: String): boolean {
        const list = this[INTERNAL_LIST]
        // Checks if specified class value exists in class attribute of the element.
        return list.indexOf(className) >= 0;
    }
    toString(): string {
        const list = this[INTERNAL_LIST]
        return list.join(' ');
    }
}
