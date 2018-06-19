import assert from "./assert";
import { getPropertyDescriptor, defineProperties, toString, getOwnPropertyNames, forEach, assign, isString, defineProperty } from "./language";
import { Component } from "./component";
import { getGlobalHTMLPropertiesInfo, getPropNameFromAttrName } from "./attributes";
import { isBeingConstructed } from "./invoker";
import { getShadowRootVM } from "./vm";

function getNodeRestrictionsDescriptors(node: Node): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const originalChildNodesDescriptor = getPropertyDescriptor(node, 'childNodes');
    return {
        childNodes: {
            get(this: Node) {
                assert.logWarning(`Discourage access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll'.`);
                return originalChildNodesDescriptor!.get!.call(this);
            },
            enumerable: true,
            configurable: true,
        },
    };
}

function getShadowRootRestrictionsDescriptors(sr: ShadowRoot): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // blacklisting properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running in fallback mode.
    const originalAddEventListener = sr.addEventListener;
    const originalQuerySelector = sr.querySelector;
    const originalQuerySelectorAll = sr.querySelectorAll;
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(sr);
    assign(descriptors, {
        addEventListener: {
            value(this: ShadowRoot, type: string, listener: EventListener, options: any) {
                // TODO: issue #420
                // this is triggered when the component author attempts to add a listener programmatically into its Component's shadow root
                if (arguments.length > 2) {
                    assert.logWarning(`Discourage feature for method 'addEventListener' in 'ShadowRoot': It does not support more than 2 arguments, instead received ${toString(options)} in ${this}. Options to make the listener passive, once or capture are not allowed.`);
                }
                originalAddEventListener.apply(this, arguments);
            },
            enumerable: true,
            configurable: true,
        },
        querySelector: {
            value(this: ShadowRoot, selector: string) {
                const vm = getShadowRootVM(this);
                assert.isFalse(isBeingConstructed(vm), `this.template.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
                return originalQuerySelector.apply(this, arguments);
            }
        },
        querySelectorAll: {
            value(this: ShadowRoot, selector: string) {
                const vm = getShadowRootVM(this);
                assert.isFalse(isBeingConstructed(vm), `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
                return originalQuerySelectorAll.apply(this, arguments);
            }
        },
        host: {
            get() {
                throw new Error(`Disallowed property "host" in ShadowRoot.`);
            },
        },
        ownerDocument: {
            get() {
                throw new Error(`Disallowed property "ownerDocument" in ShadowRoot.`);
            },
        },
        mode: {
            // from within, the shadow root is always seen as closed
            value: 'closed',
            enumerable: true,
            configurable: true,
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
        elementFromPoint: 0,
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

function getCustomElementRestrictionsDescriptors(elm: HTMLElement): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const originalAddEventListener = elm.addEventListener;
    const descriptors: PropertyDescriptorMap = getNodeRestrictionsDescriptors(elm);
    return assign(descriptors, {
        addEventListener: {
            value(this: HTMLElement, type: string, listener: EventListener, options: any) {
                // TODO: issue #420
                // this is triggered when the owner attempts to add a listener programmatically via the DOM
                if (arguments.length > 2) {
                    assert.logWarning(`Discourage feature for method 'addEventListener' in 'LightingElement': It does not support more than 2 arguments, instead received ${toString(options)} in ${this}. Options to make the listener passive, once or capture are not allowed.`);
                }
                originalAddEventListener.apply(this, arguments);
            },
            enumerable: true,
            configurable: true,
        },
    });
}

function getComponentRestrictionsDescriptors(cmp: Component): PropertyDescriptorMap {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const originalAddEventListener = cmp.addEventListener;
    const originalSetAttribute = cmp.setAttribute;
    return {
        addEventListener: {
            value(this: Component, type: string, listener: EventListener, options: any) {
                // TODO: issue #420
                // this is triggered when the component author attempts to add a listener programmatically inside the Component
                if (arguments.length > 2) {
                    assert.logWarning(`Discourage feature for method 'addEventListener' in 'LightingElement': It does not support more than 2 arguments, instead received ${toString(options)} in ${this}. Options to make the listener passive, once or capture are not allowed.`);
                }
                originalAddEventListener.apply(this, arguments);
            },
            enumerable: true,
            configurable: true,
        },
        setAttribute: {
            value(this: Component, attrName: string, value: any) {
                // logging errors for experimental and special attributes
                if (isString(attrName)) {
                    const propName = getPropNameFromAttrName(attrName);
                    const info = getGlobalHTMLPropertiesInfo();
                    if (info[propName] && info[propName].attribute) {
                        const { error, experimental } = info[propName];
                        if (error) {
                            assert.logError(error);
                        } else if (experimental) {
                            assert.logError(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
                        }
                    }
                }
                originalSetAttribute.apply(this, arguments);
            },
            enumerable: true,
            configurable: true,
        },
    };
}

export function patchNodeWithRestrictions(node: Node) {
    defineProperties(node, getNodeRestrictionsDescriptors(node));
}

export function patchShadowRootWithRestrictions(sr: ShadowRoot) {
    // This routine will prevent access to certain properties on a shadow root instance to guarantee
    // that all components will work fine in IE11 and other browsers without shadow dom support
    defineProperties(sr, getShadowRootRestrictionsDescriptors(sr));
}

export function patchCustomElementWithRestrictions(elm: HTMLElement) {
    defineProperties(elm, getCustomElementRestrictionsDescriptors(elm));
}

export function patchComponentWithRestrictions(cmp: Component) {
    defineProperties(cmp, getComponentRestrictionsDescriptors(cmp));
}

export function patchLightningElementPrototypeWithRestrictions(proto: object) {
    const info = getGlobalHTMLPropertiesInfo();
    forEach.call(getOwnPropertyNames(info), (propName: string) => {
        if (propName in proto) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(proto, propName, {
            get(this: Component) {
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
                console.log(msg.join('\n')); // tslint:disable-line
                return; // explicit undefined
            },
            // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
            set() {}, // tslint:disable-line
            enumerable: false,
        });
    });
}
