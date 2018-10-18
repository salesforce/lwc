import assert from "../shared/assert";
import { getPropertyDescriptor, defineProperties, getOwnPropertyNames, forEach, assign, isString, isUndefined, ArraySlice, toString, StringToLowerCase, setPrototypeOf, getPrototypeOf } from "../shared/language";
import { ComponentInterface } from "./component";
import { getGlobalHTMLPropertiesInfo, getPropNameFromAttrName, isAttributeLocked } from "./attributes";
import { isBeingConstructed, isRendering, vmBeingRendered } from "./invoker";
import {
    getShadowRootVM,
    getCustomElementVM,
    VM,
    getNodeOwnerKey,
    getComponentVM, getShadowRootHost
} from "./vm";
import {
    getAttribute,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
} from "./dom-api";
import { create } from "./../shared/language";

function getNodeRestrictionsDescriptors(node: Node): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const originalChildNodesDescriptor = getPropertyDescriptor(node, 'childNodes');
    return {
        childNodes: {
            get(this: Node) {
                assert.logWarning(
                    `Discouraged access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll' which returns a static NodeList.`,
                    (this instanceof Element) ? this as Element : (getShadowRootHost(this as ShadowRoot) || undefined)
                );
                return originalChildNodesDescriptor!.get!.call(this);
            },
            enumerable: true,
            configurable: true,
        },
        // TODO: add restrictions for getRootNode() method
    };
}

function getElementRestrictionsDescriptors(elm: HTMLElement): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(elm);
    assign(descriptors, {});
    return descriptors;
}

function getShadowRootRestrictionsDescriptors(sr: ShadowRoot): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // blacklisting properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running in fallback mode.
    const originalQuerySelector = sr.querySelector;
    const originalQuerySelectorAll = sr.querySelectorAll;
    const originalAddEventListener = sr.addEventListener;
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(sr);
    assign(descriptors, {
        addEventListener: {
            value(this: ShadowRoot, type: string) {
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${toString(sr)} by adding an event listener for "${type}".`);
                return originalAddEventListener.apply(this, arguments);
            }
        },
        querySelector: {
            value(this: ShadowRoot) {
                const vm = getShadowRootVM(this);
                assert.isFalse(isBeingConstructed(vm), `this.template.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
                return originalQuerySelector.apply(this, arguments);
            }
        },
        querySelectorAll: {
            value(this: ShadowRoot) {
                const vm = getShadowRootVM(this);
                assert.isFalse(isBeingConstructed(vm), `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
                return originalQuerySelectorAll.apply(this, arguments);
            }
        },
        ownerDocument: {
            get() {
                throw new Error(`Disallowed property "ownerDocument" in ShadowRoot.`);
            },
        },
    });
    const BlackListedShadowRootMethods = {
        appendChild: 0,
        removeChild: 0,
        replaceChild: 0,
        cloneNode: 0,
        insertBefore: 0,
        getElementById: 0,
        getSelection: 0,
        elementsFromPoint: 0,
    };
    forEach.call(getOwnPropertyNames(BlackListedShadowRootMethods), (methodName: string) => {
        const descriptor = {
            get() {
                throw new Error(`Disallowed method "${methodName}" in ShadowRoot.`);
            }
        };
        descriptors[methodName] = descriptor;
    });
    return descriptors;
}

// Custom Elements Restrictions:
// -----------------------------

function getAttributePatched(this: HTMLElement, attrName: string): string | null {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getCustomElementVM(this);
        assertAttributeReflectionCapability(vm, attrName);
    }

    return getAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributePatched(this: HTMLElement, attrName: string, newValue: any) {
    const vm = getCustomElementVM(this);
    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    setAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributeNSPatched(this: HTMLElement, attrNameSpace: string, attrName: string, newValue: any) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    setAttributeNS.apply(this, ArraySlice.call(arguments));
}

function removeAttributePatched(this: HTMLElement, attrName: string) {
    const vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    removeAttribute.apply(this, ArraySlice.call(arguments));
}

function removeAttributeNSPatched(this: HTMLElement, attrNameSpace: string, attrName: string) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
    }
    removeAttributeNS.apply(this, ArraySlice.call(arguments));
}

function assertAttributeReflectionCapability(vm: VM, attrName: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const propName = isString(attrName) ? getPropNameFromAttrName(StringToLowerCase.call(attrName)) : null;
    const { elm, def: { props: propsConfig } } = vm;

    if (!isUndefined(getNodeOwnerKey(elm)) && isAttributeLocked(elm, attrName) && propsConfig && propName && propsConfig[propName]) {
        assert.logError(`Invalid attribute "${StringToLowerCase.call(attrName)}" for ${vm}. Instead access the public property with \`element.${propName};\`.`, elm);
    }
}

function assertAttributeMutationCapability(vm: VM, attrName: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { elm } = vm;
    if (!isUndefined(getNodeOwnerKey(elm)) && isAttributeLocked(elm, attrName)) {
        assert.logError(`Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute "${attrName}", you can update the state of the component, and let the engine to rehydrate the element accordingly.`, elm);
    }
}

function getCustomElementRestrictionsDescriptors(elm: HTMLElement): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(elm);
    const originalAddEventListener = elm.addEventListener;
    return assign(descriptors, {
        addEventListener: {
            value(this: ShadowRoot, type: string) {
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${toString(elm)} by adding an event listener for "${type}".`);
                return originalAddEventListener.apply(this, arguments);
            }
        },
        // replacing mutators and accessors on the element itself to catch any mutation
        getAttribute: {
            value: getAttributePatched,
            configurable: true,
        },
        setAttribute: {
            value: setAttributePatched,
            configurable: true,
        },
        setAttributeNS: {
            value: setAttributeNSPatched,
            configurable: true,
        },
        removeAttribute: {
            value: removeAttributePatched,
            configurable: true,
        },
        removeAttributeNS: {
            value: removeAttributeNSPatched,
            configurable: true,
        },
    });
}

function getComponentRestrictionsDescriptors(cmp: ComponentInterface): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const originalSetAttribute = cmp.setAttribute;
    return {
        setAttribute: {
            value(this: ComponentInterface, attrName: string, value: any) {
                // logging errors for experimental and special attributes
                if (isString(attrName)) {
                    const propName = getPropNameFromAttrName(attrName);
                    const info = getGlobalHTMLPropertiesInfo();
                    if (info[propName] && info[propName].attribute) {
                        const { error, experimental } = info[propName];
                        if (error) {
                            assert.logError(error, getComponentVM(this).elm);
                        } else if (experimental) {
                            assert.logError(
                                `Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`,
                                getComponentVM(this).elm
                            );
                        }
                    }
                }
                originalSetAttribute.apply(this, arguments);
            },
            enumerable: true,
            configurable: true,
            writable: true,
        },
        tagName: {
            get(this: ComponentInterface) {
                throw new Error(
                    `Usage of property \`tagName\` is disallowed because the component itself does not know which tagName will be used to create the element, therefore writing code that check for that value is error prone.`,
                );
            },
            enumerable: true,
            configurable: true,
        },
    };
}

function getLightingElementProtypeRestrictionsDescriptors(proto: object): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const info = getGlobalHTMLPropertiesInfo();
    const descriptors = {};
    forEach.call(getOwnPropertyNames(info), (propName: string) => {
        if (propName in proto) {
            return; // no need to redefine something that we are already exposing
        }
        descriptors[propName] = {
            get(this: ComponentInterface) {
                const { error, attribute, readOnly, experimental } = info[propName];
                const msg: any[] = [];
                msg.push(`Accessing the global HTML property "${propName}" in ${this} is disabled.`);
                if (error) {
                    msg.push(error);
                } else {
                    if (experimental) {
                        msg.push(`This is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`);
                    }
                    if (readOnly) {
                        // TODO - need to improve this message
                        msg.push(`Property is read-only.`);
                    }
                    if (attribute) {
                        msg.push(`"Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                        msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                        msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                    }
                }
                assert.logWarning(msg.join('\n'), getComponentVM(this).elm);
                return; // explicit undefined
            },
            // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
            set() {}, // tslint:disable-line
        };
    });
    return descriptors;
}

export function patchNodeWithRestrictions(node: Node) {
    defineProperties(node, getNodeRestrictionsDescriptors(node));
}

export function patchElementWithRestrictions(elm: HTMLElement) {
    defineProperties(elm, getElementRestrictionsDescriptors(elm));
}

// This routine will prevent access to certain properties on a shadow root instance to guarantee
// that all components will work fine in IE11 and other browsers without shadow dom support.
export function patchShadowRootWithRestrictions(sr: ShadowRoot) {
    defineProperties(sr, getShadowRootRestrictionsDescriptors(sr));
}

export function patchCustomElementWithRestrictions(elm: HTMLElement) {
    const restrictionsDescriptors = getCustomElementRestrictionsDescriptors(elm);
    const elmProto = getPrototypeOf(elm);
    setPrototypeOf(elm, create(elmProto, restrictionsDescriptors));
}

export function patchComponentWithRestrictions(cmp: ComponentInterface) {
    defineProperties(cmp, getComponentRestrictionsDescriptors(cmp));
}

export function patchLightningElementPrototypeWithRestrictions(proto: object) {
    defineProperties(proto, getLightingElementProtypeRestrictionsDescriptors(proto));
}
