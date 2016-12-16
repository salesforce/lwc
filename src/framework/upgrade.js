import assert from "./assert.js";
import { h } from "./api.js";
import { patch } from "./patcher.js";
import { setAttribute, removeAttribute } from "./attributes.js";
import { getComponentDef } from "./def.js";
import * as hook from "./hook.js";

const fakeElement = document.createElement('raptor'); // fake element to patch and resolve vm.elm
const CustomElementState = Symbol('custom-element-state');

function linkAttributes(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { Ctor, component } = vm;
    let { attrs } = getComponentDef(Ctor);
    // replacing mutators on the element itself to catch any mutation
    element.setAttribute = (attrName: string, value: any) => {
        Element.prototype.setAttribute.call(element, attrName, value);
        if (attrs.hasOwnProperty(attrName)) {
            setAttribute(vm, attrName, value);
        }
    };
    element.removeAttribute = (attrName: string) => {
        Element.prototype.removeAttribute.call(element, attrName);
        if (attrs.hasOwnProperty(attrName)) {
            removeAttribute(vm, attrName);
        }
    };
    element.getAttribute = (attrName: string): any => {
        if (attrs.hasOwnProperty(attrName)) {
            return component[attrs[attrName].propName];
        } else {
            return Element.prototype.getAttribute.call(element, attrName);
        }
    };
    assert.block(() => {
        // this is to warn in dev mode when they try to do an invalid mutation on an element.
        const observer = new MutationObserver((mutations: Array<MutationRecord>) => {
            mutations.forEach((mutation: MutationRecord) => {
                console.error(`Arbitrary mutations in a child element of the Raptor Element <${element.tagName}> can have unpredictable results. Instead, you can use setAttribute(), getAttribute() and removeAttribute() on the Raptor Element to mutate its state.`);
            });
        });
        const config: MutationObserverInit = {
            childList: true,
        };
        observer.observe(element, config);
    });
}

function linkProperties(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { Ctor, component } = vm;
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
            configurable: false,
            enumerable: true,
        };
        assert.block(() => {
            descriptors[propName].set = () => {
                const { attrName } = props[propName];
                throw new Error(`Invalid mutation of Raptor Element via property setter: <${element.tagName}>.${propName}. Instead use setAttribute("${attrName}", ...) or removeAttribute("${attrName}").`);
            };
        });
    }
    Object.defineProperties(element, descriptors);
}

function createVM(element: HTMLElement, Ctor: any): VM {
    let vm = h(Ctor.name, { hook });
    vm.Ctor = Ctor;
    /**
     * Snabdom does not have a way to process the vnode to produce an element, instead we need to
     * patch the vnode against some fake html element, then we can inspect the element. More here:
     * https://github.com/snabbdom/snabbdom/issues/156
     */
    vm = patch(fakeElement.cloneNode(), vm);
    element.appendChild(vm.elm);
    return vm;
}

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element: HTMLElement, Ctor: ObjectConstructor, domAttrs: HashTable<any>): Component {
    if (!(element instanceof HTMLElement)) {
        throw new TypeError(`Raptor.upgrade() first argument should be a DOM Element instead of ${element}.`);
    }
    if (CustomElementState in element) {
        throw new ReferenceError('Element ${element} was already upgraded.');
    }
    if (!Ctor) {
        throw new TypeError(`Raptor.upgrade() second argument should be a Raptor Component Definition or a Promise to a Raptor Component Definition instead of ${Ctor}.`);
    }
    element[CustomElementState] = 'upgraded';
    const tagName = element.tagName.toLocaleLowerCase();
    assert.block(() => {
        if (Ctor.tagName && tagName !== Ctor.tagName) {
            console.warn(`Raptor Component ${Ctor.name} is normally used for <${Ctor.tagName}> elements instead of <${tagName}>.`);
        }
    });
    const vm = createVM(element, Ctor);
    const { attrs } = getComponentDef(Ctor);
    for (let attrName in attrs) {
        if (attrName in domAttrs) {
            setAttribute(vm, attrName, domAttrs[attrName]);
        }
    }
    linkAttributes(element, vm);
    linkProperties(element, vm);
    return vm.component;
}

function extractOriginalDomAttributes(element: Element): HashTable<any> {
    const domAttrs = {};
    if (element.hasAttributes()) {
        const originalDomAttrs = element.attributes;
        for (var i = originalDomAttrs.length - 1; i >= 0; i--) {
            const { name, value } = originalDomAttrs[i];
            domAttrs[name] = value;
        }
    }
    return domAttrs;
}

/**
 * This method implements some branching logic to speed up the process of upgrading
 * the element if the constructor is not a promise.
 */
export function upgrade(element: HTMLElement, CtorOrPromise: Promise<ObjectConstructor> | ObjectConstructor): Promise<HTMLElement> {
    return new Promise((resolve, reject): HTMLElement => {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError(`Raptor.upgrade() first argument should be a DOM Element instead of ${element}.`);
        }
        const domAttrs = extractOriginalDomAttributes(element);
        const p = Promise.resolve(CtorOrPromise);
        // If component definition is a promise, few more things should happen before the upgrade
        if (p === CtorOrPromise) {
            // temporarily replacing mutators on the element itself to catch any mutation
            // while waiting for the Ctor to be ready to upgrade the element. This guarantees
            // that any attribute mutation after upgrade() is called is consistent, even when
            // the element hasn't been fully upgraded.
            element.setAttribute = (attrName: string, value: any) => {
                domAttrs[attrName] = value;
                Element.prototype.setAttribute.call(element, attrName, value);
            };
            element.removeAttribute = (attrName: string) => {
                domAttrs[attrName] = null;
                Element.prototype.removeAttribute.call(element, attrName);
            };
            element.getAttribute = (attrName: string): any => {
                return domAttrs[attrName];
            };
            const result = p.then((Ctor: ObjectConstructor): Component => {
                upgradeElement(element, Ctor, domAttrs);
                resolve(element);
            });
            result.then(undefined, reject).catch(() => {
                element[CustomElementState] = 'failed';
            });
        }
        // By doing this, we gain one micro-task since the process of upgrading is fully sync.
        // This is useful because most calls to `upgrade()` will not wait for the result.
        upgradeElement(element, CtorOrPromise, domAttrs);
        resolve(element);
    });
}
