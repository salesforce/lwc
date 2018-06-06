import assert from "../assert";
import { isUndefined, defineProperty, isNull, defineProperties, create, getOwnPropertyNames, forEach, hasOwnProperty, toString, isFalse } from "../language";
import { getShadowRootVM, VM } from "../vm";
import { addRootEventListener, removeRootEventListener } from "../events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll, shadowRootChildNodes } from "./traverse";
import {
    GlobalAOMProperties,
} from './attributes';
import {
    setAttribute,
    removeAttribute,
} from './element';
import { ViewModelReflection, getAttrNameFromPropName } from "../utils";
import { childNodesGetter } from "./node";

export const usesNativeShadowRoot = typeof (window as any).ShadowRoot !== "undefined";
const ShadowRootPrototype = usesNativeShadowRoot ? (window as any).ShadowRoot.prototype : undefined;
const attachShadowOriginal = usesNativeShadowRoot ? Element.prototype.attachShadow : undefined;

export function attachShadow(elm, options, fallback): ShadowRoot {
    let sr: ShadowRoot;
    if (isFalse(fallback)) {
        if (process.env.NODE_ENV !== 'production') {
            if (isFalse(usesNativeShadowRoot)) {
                throw new Error(`ShadowDOM is not supported.`);
            }
        }
        sr = (attachShadowOriginal as any).call(elm, options);
    } else {
        sr = create(ArtificialShadowRootPrototype) as ShadowRoot;
    }
    if (process.env.NODE_ENV !== 'production') {
        // blacklisting properties in dev mode only to avoid people doing the wrong
        // thing when using the real shadow root, because if that's the case,
        // the component will not work when running in fallback mode.
        defineProperties(sr, DevModeBlackListDescriptorMap);
    }
    return sr as ShadowRoot;
}

export function linkShadow(shadowRoot: ShadowRoot, vm: VM) {
    shadowRoot[ViewModelReflection] = vm;
}

function patchedShadowRootChildNodes(this: ShadowRoot): Element[] {
    const vm = getShadowRootVM(this);
    return shadowRootChildNodes(vm, vm.elm);
}

const ArtificialShadowRootDescriptors: PropertyDescriptorMap = {
    mode: { value: 'closed' },
    childNodes: {
        get: patchedShadowRootChildNodes,
    },
    delegatesFocus: { value: false },
    querySelector: {
        value(this: ShadowRoot, selector: string): Element | null {
            const vm = getShadowRootVM(this);
            const node = shadowRootQuerySelector(vm, selector);
            if (process.env.NODE_ENV !== 'production') {
                if (isNull(node)) {
                    if (vm.elm.querySelector(selector)) {
                        assert.logWarning(`this.template.querySelector() can only return elements from the template declaration of ${vm}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
                    }
                }
            }
            return node as Element;
        }
    },
    querySelectorAll: {
        value(this: ShadowRoot, selector: string): Element[] {
            const vm = getShadowRootVM(this);
            const nodeList = shadowRootQuerySelectorAll(vm, selector);
            if (process.env.NODE_ENV !== 'production') {
                if (nodeList.length === 0) {
                    const results = vm.elm.querySelectorAll(selector);
                    if (results.length) {
                        assert.logWarning(`this.template.querySelectorAll() can only return elements from template declaration of ${vm}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
                    }
                }
            }
            return nodeList;
        }
    },
    addEventListener: {
        value(this: ShadowRoot, type: string, listener: EventListener, options: any) {
            const vm = getShadowRootVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);

                if (arguments.length > 2) {
                    // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                    assert.logWarning(`this.template.addEventListener() on ${vm} does not support more than 2 arguments, instead received ${toString(options)}. Options to make the listener passive, once or capture are not allowed.`);
                }
            }
            addRootEventListener(vm, type, listener);
        }
    },
    removeEventListener: {
        value(this: ShadowRoot, type: string, listener: EventListener, options: any) {
            const vm = getShadowRootVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);

                if (arguments.length > 2) {
                    // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                    assert.logWarning(`this.template.removeEventListener() on ${vm} does not support more than 2 arguments, instead received ${toString(options)}. Options to make the listener passive, once or capture are not allowed.`);
                }
            }
            removeRootEventListener(vm, type, listener);
        }
    },
    toString: {
        value() {
            return `[object ShadowRoot]`;
        }
    },
};

function createAccessibilityDescriptorForShadowRoot(propName: string, attrName: string, defaultValue: any): PropertyDescriptor {
    // we use value as the storage mechanism and as the default value for the property
    return {
        enumerable: false,
        get(this: ShadowRoot): any {
            const vm = getShadowRootVM(this);
            if (!hasOwnProperty.call(vm.rootProps, propName)) {
                return defaultValue;
            }
            return vm.rootProps[propName];
        },
        set(this: ShadowRoot, newValue: any) {
            const vm = getShadowRootVM(this);
            vm.rootProps[propName] = newValue;
            if (!isUndefined(vm.hostAttrs[attrName])) {
                return;
            }
            if (isNull(newValue)) {
                removeAttribute.call(vm.elm, attrName);
                return;
            }
            setAttribute.call(vm.elm, attrName, newValue);
        }
    };
}

// This routine will add all AOM DOM properties to ShadowRoot.prototype to polyfill AOM capabilities when needed
forEach.call(getOwnPropertyNames(GlobalAOMProperties), (propName: string) => {
    const descriptor = createAccessibilityDescriptorForShadowRoot(propName, getAttrNameFromPropName(propName), GlobalAOMProperties[propName]);
    if (!isUndefined(ShadowRootPrototype) && !hasOwnProperty.call(ShadowRootPrototype, propName)) {
        // conditionally polyfilling the original ShadowRoot.prototype
        defineProperty(ShadowRootPrototype, propName, descriptor);
    }
    // always adding it to ArtificialShadowRootDescriptors
    ArtificialShadowRootDescriptors[propName] = descriptor;
});

const ArtificialShadowRootPrototype = create({}, ArtificialShadowRootDescriptors);
let DevModeBlackListDescriptorMap: PropertyDescriptorMap;

if (process.env.NODE_ENV === 'dev') {
    DevModeBlackListDescriptorMap = {
        childNodes: {
            get(this: ShadowRoot) {
                const vm = getShadowRootVM(this);
                if (process.env.NODE_ENV !== 'production') {
                    assert.logWarning(`this.template.childNodes returns a live nodelist and should not be relied upon. Instead, use this.template.querySelectorAll.`);
                }
                if (vm.fallback) {
                    return patchedShadowRootChildNodes.call(this);
                }
                return childNodesGetter.call(this);
            }
        },
    };

    const BlackListedShadowRootMethods = {
        appendChild: 0,
        cloneNode: 0,
        compareDocumentPosition: 0,
        contains: 0,
        insertBefore: 0,
        hasChildNodes: 0,
        getElementById: 0,
        getSelection: 0,
        elementFromPoint: 0,
        elementsFromPoint: 0,
    };
    // This routine will prevent access to certain methods on a shadow root instance to guarantee
    // that all components will work fine in IE11 and other browsers without shadow dom support
    forEach.call(getOwnPropertyNames(BlackListedShadowRootMethods), (methodName: string) => {
        const descriptor = {
            get() {
                throw new Error(`Disallowed method "${methodName}" in ShadowRoot.`);
            }
        };
        DevModeBlackListDescriptorMap[methodName] = descriptor;
    });

    const BlackListedShadowRootProperties = {
        firstChild: 0,
        lastChild: 0,
        ownerDocument: 0,
        innerHTML: 0,
        outerHTML: 0,
        textContent: 0,
    };
    // This routine will prevent access to certain properties on a shadow root instance to guarantee
    // that all components will work fine in IE11 and other browsers without shadow dom support
    forEach.call(getOwnPropertyNames(BlackListedShadowRootProperties), (propName: string) => {
        const descriptor = {
            get() {
                throw new Error(`Disallowed property "${propName}" in ShadowRoot.`);
            }
        };
        DevModeBlackListDescriptorMap[propName] = descriptor;
    });
}
