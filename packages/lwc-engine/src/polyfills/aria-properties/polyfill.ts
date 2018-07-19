// This is only needed in this polyfill because we closed the ability
// to access the host from a shadow root instance in LWC.
import { getShadowRootHost, getNodeKey } from '../../framework/vm';

// this regular expression is used to transform aria props into aria attributes because
// that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`
const ARIA_REGEX = /^aria/;
const CAMEL_REGEX = /-([a-z])/g;

// Global Aria and Role Properties derived from ARIA and Role Attributes.
// https://wicg.github.io/aom/spec/aria-reflection.html
export const ElementPrototypeAriaPropertyNames = [
    'ariaAutoComplete',
    'ariaChecked',
    'ariaCurrent',
    'ariaDisabled',
    'ariaExpanded',
    'ariaHasPopUp',
    'ariaHidden',
    'ariaInvalid',
    'ariaLabel',
    'ariaLevel',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRequired',
    'ariaSelected',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'ariaLive',
    'ariaRelevant',
    'ariaAtomic',
    'ariaBusy',
    'ariaActiveDescendant',
    'ariaControls',
    'ariaDescribedBy',
    'ariaFlowTo',
    'ariaLabelledBy',
    'ariaOwns',
    'ariaPosInSet',
    'ariaSetSize',
    'ariaColCount',
    'ariaColIndex',
    'ariaDetails',
    'ariaErrorMessage',
    'ariaKeyShortcuts',
    'ariaModal',
    'ariaPlaceholder',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'role',
];

interface AriaPropMap {
    host: Record<string, any>;
    sr: Record<string, any>;
}

const nodeToAriaPropertyValuesMap: WeakMap<HTMLElement | ShadowRoot, AriaPropMap> = new WeakMap();
const { hasOwnProperty } = Object.prototype;
const { setAttribute, removeAttribute, getAttribute } = Element.prototype;
const isNativeShadowRootAvailable = typeof (window as any).ShadowRoot !== "undefined";
const {
    replace: StringReplace,
    toLowerCase: StringToLowerCase,
    toUpperCase: StringToUpperCase,
} = String.prototype;

function getAriaPropertyMap(elm: HTMLElement): AriaPropMap {
    let map = nodeToAriaPropertyValuesMap.get(elm);
    if (map === undefined) {
        map = { host: {}, sr: {} };
        nodeToAriaPropertyValuesMap.set(elm, map);
        // the first time that we interact with a custom element via aria props
        // we should patch the host removeAttribute, so it can fallback.
        patchCustomElementAttributeMethods(elm);
    }
    return map;
}

function isShadowRoot(elmOrShadow: Element | ShadowRoot): elmOrShadow is ShadowRoot {
    return !(elmOrShadow instanceof Element) && 'host' in elmOrShadow;
}

function isSignedCustomElement(elmOrShadow: Element | ShadowRoot): elmOrShadow is HTMLElement {
    return !isShadowRoot(elmOrShadow) && getNodeKey(elmOrShadow) !== undefined;
}

function getNormalizedAriaPropertyValue(propName: string, value: any): any {
    return value == null ? null : value + '';
}

function patchCustomElementAttributeMethods(elm: HTMLElement) {
    const {
        setAttribute: originalSetAttribute,
        removeAttribute: originalRemoveAttribute,
    } = elm;
    Object.defineProperties(elm, {
        removeAttribute: {
            value(this: HTMLElement, attrName: string) {
                const propName = StringReplace.call(attrName, CAMEL_REGEX, (g: string): string => StringToUpperCase.call(g[1]));
                let newValue = null;
                if (hasOwnProperty.call(descriptors, propName)) {
                    newValue = getAriaPropertyMap(this).sr[propName];
                }
                if (newValue === null) {
                    originalRemoveAttribute.call(this, attrName);
                } else {
                    originalSetAttribute.call(this, attrName, newValue);
                }
            },
            enumerable: true,
            configurable: true,
        },
    });
}

function createAriaPropertyPropertyDescriptor(propName: string, attrName: string, defaultValue: any): PropertyDescriptor {
    return {
        get(this: Element | ShadowRoot): any {
            const node = this;
            if (isSignedCustomElement(node)) {
                const map = getAriaPropertyMap(node);
                if (hasOwnProperty.call(map.host, propName)) {
                    return map.host[propName];
                } else if (hasOwnProperty.call(map.sr, propName)) {
                    return null;
                }
            } else if (isShadowRoot(node)) {
                // supporting regular custom elements and LWC
                const host = getShadowRootHost(node) || node.host as HTMLElement;
                const map = getAriaPropertyMap(host);
                return hasOwnProperty.call(map, propName) ? map[propName] : null;
            }
            // regular html elements are just going to reflect what's in the attribute
            return getAttribute.call(node, attrName);
        },
        set(this: Element | ShadowRoot, newValue: any) {
            const node = this;
            newValue = getNormalizedAriaPropertyValue(propName, newValue);
            if (isSignedCustomElement(node)) {
                const map = getAriaPropertyMap(node);
                map.host[propName] = newValue;
                if (newValue === null && hasOwnProperty.call(map.sr, propName) && map.sr[propName] !== null) {
                    newValue = map.sr[propName]; // falling back to the shadow root's value
                }
            } else if (isShadowRoot(node)) {
                // supporting regular custom elements and LWC
                const host = getShadowRootHost(node) || node.host as HTMLElement;
                const map = getAriaPropertyMap(host);
                map.sr[propName] = newValue;
                if (!hasOwnProperty.call(map.host, propName) || map.host[propName] === null) {
                // the host already have a value for this property
                    if (newValue === null) {
                        removeAttribute.call(host, attrName);
                    } else {
                        setAttribute.call(host, attrName, newValue);
                    }
                }
                return;
            }
            // regular html elements are just going to reflect what's in the attribute
            // while host and shadow roots will update the host when needed
            if (newValue === null) {
                removeAttribute.call(node, attrName);
            } else {
                setAttribute.call(node, attrName, newValue);
            }
        },
        configurable: true,
        enumerable: true,
    };
}

const descriptors: PropertyDescriptorMap = {};

export function patch() {
    for (let i = 0, len = ElementPrototypeAriaPropertyNames.length; i < len; i += 1) {
        const propName = ElementPrototypeAriaPropertyNames[i];
        if (Object.getOwnPropertyDescriptor(Element.prototype, propName) === undefined) {
            const attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
            descriptors[propName] = createAriaPropertyPropertyDescriptor(propName, attrName, null);
        }
    }
    Object.defineProperties(Element.prototype, descriptors);
    if (isNativeShadowRootAvailable) {
        Object.defineProperties((window as any).ShadowRoot.prototype, descriptors);
    }
}
