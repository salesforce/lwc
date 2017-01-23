import assert from "./assert.js";
import { patch } from "./hook.js";
import {
    resetComponentProp,
    updateComponentProp,
} from "./component.js";
import { getComponentDef } from "./def.js";
import { c } from "./api.js";
import { loaderImportMethod } from "./loader.js";
import { defineProperties } from "./language.js";

const Ep = Element.prototype;
const CAMEL_REGEX = /-([a-z])/g;

function linkAttributes(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { cache: { def: { attrs } } } = vm;
    // replacing mutators on the element itself to catch any mutation
    element.setAttribute = (attrName: string, value: any) => {
        Ep.setAttribute.call(element, attrName, value);
        const attrConfig = attrs[attrName.toLocaleLowerCase()];
        if (attrConfig) {
            updateComponentProp(vm, attrConfig.propName, value);
        }
    };
    element.removeAttribute = (attrName: string) => {
        Ep.removeAttribute.call(element, attrName);
        const attrConfig = attrs[attrName.toLocaleLowerCase()];
        if (attrConfig) {
            resetComponentProp(vm, attrConfig.propName);
        }
    };
}

function linkProperties(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { Ctor, cache: { component } } = vm;
    let { props, methods } = getComponentDef(Ctor);
    const descriptors: PropertyDescriptorMap = {};
    // linking public methods
    for (let methodName in methods) {
        descriptors[methodName] = {
            value: function (): any {
                return component[methodName](...arguments);
            },
            configurable: false,
            writable: false,
            enumerable: false,
        };
    }
    // linking reflective properties
    for (let propName in props) {
        descriptors[propName] = {
            get: (): any => component[propName],
            set: (newValue: any): void => updateComponentProp(vm, propName, newValue),
            configurable: false,
            enumerable: true,
        };
    }
    defineProperties(element, descriptors);
}

function createVM(element: HTMLElement, Ctor: any, data: HashTable<any>): VM {
    const tagName = element.tagName.toLowerCase();
    let vm = c(tagName, Ctor, data);
    return patch(element, vm);
}

function getInitialProps(element: HTMLElement, Ctor: ObjectConstructor): HashTable<any> {
    const { props: config } = getComponentDef(Ctor);
    const props = {};
    for (let propName in config) {
        if (propName in element) {
            props[propName] = element[propName];
        }
    }
    if (element.hasAttributes()) {
        // looking for custom attributes that are not reflectives by default
        const attrs = element.attributes;
        for (let i = attrs.length - 1; i >= 0; i--) {
            const propName = attrs[i].name.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
            if (!(propName in props) && propName in config) {
                props[propName] = attrs[i].value;
            }
        }
    }
    return props;
}

function getInitialSlots(element: HTMLElement, Ctor: ObjectConstructor): HashTable<any> {
    // TODO: implement algo to resolve slots
    return undefined;
}

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element: HTMLElement, Ctor: ObjectConstructor): Component {
    if (!Ctor) {
        throw new TypeError(`Invalid Raptor Component Definition: ${Ctor}.`);
    }
    const props = getInitialProps(element, Ctor);
    const slots = getInitialSlots(element, Ctor);
    const vm = createVM(element, Ctor, { props, slots });
    linkAttributes(element, vm);
    // TODO: for vm with element we might not need to do any of these.
    linkProperties(element, vm);
    return vm.cache.component;
}

function upgrade(element: HTMLElement, CtorOrPromise: Promise<ObjectConstructor> | ObjectConstructor): Promise<HTMLElement> {
    return new Promise((resolve: (element: HTMLElement) => void, reject: (e: Error) => void) => {
        assert.isTrue(element instanceof HTMLElement, `upgrade() first argument should be a DOM Element instead of ${element}.`);
        const p = Promise.resolve(CtorOrPromise);
        p.then((Ctor: ObjectConstructor) => {
            upgradeElement(element, Ctor);
            resolve(element);
        }, reject);
    });
}

const definedElements = {};
const createElementOriginal = document.createElement;

export function createElement(tagName: string): HTMLElement {
    const element = createElementOriginal.call(this, ...arguments);
    if (!tagName || tagName in definedElements || tagName.indexOf('-') === -1 || !(element instanceof HTMLElement)) {
        return element;
    }
    // it must be a raptor element, lets derivate the namespace from tagName,
    // where only the first `-` should be replaced
    const moduleName = element.tagName.toLowerCase().replace('-', ':');
    // TODO: maybe a local hash of resolved modules to speed things up.
    upgrade(element, loaderImportMethod(moduleName)).catch((e: Error) => {
        console.error(`Error trying to upgrade element <${element.tagName.toLowerCase()}>. ${e}`);
    });
    return element;
}

try {
    document.createElement = createElement;
} catch (e) {
    console.warn(`document.createElement cannot be redefined. ${e}`);
}

try {
    if (typeof customElements !== undefined && customElements.define) {
        const defineOriginal = customElements.define;
        customElements.define = function (tagName: string) {
            defineOriginal.call(this, ...arguments);
            definedElements[tagName] = undefined;
        }
    }
} catch (e) {
    console.warn(`customElements.define cannot be redefined. ${e}`);
}
