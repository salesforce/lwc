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

type AriaPropMap = Record<string, any>;

const nodeToAriaPropertyValuesMap: WeakMap<HTMLElement, AriaPropMap> = new WeakMap();
const { hasOwnProperty } = Object.prototype;
const { hasAttribute, setAttribute, removeAttribute, getAttribute } = Element.prototype;
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
                    const map = getAriaPropertyMap(this);
                    newValue = map[propName];
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
        get(this: HTMLElement): any {
            const map = getAriaPropertyMap(this);
            if (hasOwnProperty.call(map, propName)) {
                return map[propName];
            }
            // otherwise just reflect what's in the attribute
            return hasAttribute.call(this, attrName) ? getAttribute.call(this, attrName) : null;
        },
        set(this: HTMLElement, newValue: any) {
            newValue = getNormalizedAriaPropertyValue(propName, newValue);
            const map = getAriaPropertyMap(this);
            map[propName] = newValue;
            // reflect into the corresponding attribute
            if (newValue === null) {
                removeAttribute.call(this, attrName);
            } else {
                setAttribute.call(this, attrName, newValue);
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
}
