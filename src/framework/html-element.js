import assert from "./assert.js";
import { vmBeingCreated } from "./invoker.js";

const ComponentToVMMap = new WeakMap();

const HTMLElementPropsTheGoodParts = [
    "tagName",
];
const HTMLElementMethodsTheGoodParts = [
    "querySelector",
    "querySelectorAll",
    "addEventListener",
];

const CAMEL_REGEX = /-([a-z])/g;

class RaptorHTMLElement {
    constructor() {
        assert.vm(vmBeingCreated, 'Invalid creation patch for ${this} who extends HTMLElement. It expects a vm, instead received ${vmBeingCreated}.');
        linkComponentToVM(this, vmBeingCreated);
    }
    dispatchEvent(event: Event): boolean {
        const vm = ComponentToVMMap.get(this);
        assert.vm(vm);
        const { elm } = vm;
        // custom elements will rely on the DOM dispatchEvent mechanism
        assert.isTrue(elm instanceof HTMLElement, 'Invalid association between Raptor component ${this} and element ${element} when calling method ${methodName}.');
        return elm.dispatchEvent(event);
    }
    getAttribute(attrName: string): string {
        const vm = ComponentToVMMap.get(this);
        assert.vm(vm);
        const { cache: { state, def: { props } } } = vm;
        const propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
        if (props[propName]) {
            assert.block(() => {
                throw new Error(`Attribute "${attrName}" of ${vm} is automatically reflected from public property ${propName}. Use <code>this.${propName}</code> instead of <code>this.getAttribute("${attrName}")</code>.`);
            });
            return;
        }
        return state[propName];
    }
    setAttribute(attrName: string, value: any) {
        const vm = ComponentToVMMap.get(this);
        assert.vm(vm);
        const { cache: { state, def: { props } } } = vm;
        const propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
        if (props[propName]) {
            assert.block(() => {
                throw new Error(`Attribute "${attrName}" of ${vm} is automatically reflected from public property ${propName}. You cannot modify it.`);
            });
            return;
        }
        state[propName] = '' + value;
    }
    removeAttr(attrName: string) {
        const vm = ComponentToVMMap.get(this);
        assert.vm(vm);
        const { cache: { state, def: { props } } } = vm;
        const propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
        if (props[propName]) {
            assert.block(() => {
                throw new Error(`Attribute "${attrName}" of ${vm} is automatically reflected from public property ${propName}. You cannot remove it.`);
            });
            return;
        }
        state[propName] = undefined;
    }
}

// One time operation to expose the good parts of the web component API,
// in terms of methods and properties:
HTMLElementMethodsTheGoodParts.reduce((proto: any, methodName: string): any => {
    proto[methodName] = function (...args: Array<any>): any {
        const vm = ComponentToVMMap.get(this);
        assert.vm(vm);
        const { elm } = vm;
        assert.isTrue(elm instanceof HTMLElement, `Invalid association between Raptor component ${this} and element ${elm} when calling method ${methodName}.`);
        return elm[methodName](...args);
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
