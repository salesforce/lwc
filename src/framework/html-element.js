import assert from "./assert.js";
import { vmBeingCreated } from "./invoker.js";

const ComponentToVMMap = new WeakMap();

const HTMLElementPropsTheGoodParts = [];
const HTMLElementMethodsTheGoodParts = [
    "querySelector",
    "querySelectorAll",
];

class RaptorHTMLElement {
    constructor() {
        assert.vm(vmBeingCreated, 'Invalid creation patch for ${this} who extends HTMLElement. It expects a vm, instead received ${vmBeingCreated}.');
        linkComponentToVM(this, vmBeingCreated);
    }
    dispatchEvent(event: Event): boolean {
        const vm = ComponentToVMMap.get(this);
        assert.vm(vm);
        const { hasElement, data, elm } = vm;
        if (hasElement) {
            // custom elements will rely on the DOM dispatchEvent mechanism
            assert.isTrue(elm instanceof HTMLElement, 'Invalid association between Raptor component ${this} and element ${element} when calling method ${methodName}.');
            return elm.dispatchEvent(event);
        } else if (data && data.on && data.on[event.type]) {
            // raptor components will just call a regular callback passing
            // the custom event as the only argument
            data.on[event.type].call(undefined, event);
        }
        return false;
    }
}

// One time operation to expose the good parts of the web component API,
// in terms of methods and properties:
HTMLElementMethodsTheGoodParts.reduce((proto: any, methodName: string): any => {
    proto[methodName] = function (...args: Array<any>): any {
        const element = ComponentToVMMap.get(this);
        assert.isTrue(element instanceof HTMLElement, 'Invalid association between Raptor component ${this} and element ${element} when calling method ${methodName}.');
        return element[methodName](...args);
    };
    return proto;
}, RaptorHTMLElement.prototype);

HTMLElementPropsTheGoodParts.reduce((proto: any, propName: string): any => {
    Object.defineProperty(proto, propName, {
        get: function (): any {
            const element = ComponentToVMMap.get(this);
            assert.isTrue(element instanceof HTMLElement, 'Invalid association between Raptor component ${this} and element ${element} when accessing member property @{propName}.');
            return element[propName];
        },
        enumerable: true,
        configurable: false,
    });
    return proto;
}, RaptorHTMLElement.prototype);

export { RaptorHTMLElement as HTMLElement };

export function linkComponentToVM(component: Component, vm: VM) {
    assert.isTrue(component instanceof RaptorHTMLElement, 'Only components extending HTMLElement can be linked to their corresponding element.');
    assert.vm(vm);
    assert.isTrue(vm.elm instanceof HTMLElement, 'Only DOM elements can be linked to their corresponding raptor component.');
    ComponentToVMMap.set(component, vm);
}
