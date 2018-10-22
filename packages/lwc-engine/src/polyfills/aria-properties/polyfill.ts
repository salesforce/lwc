// this regular expression is used to transform aria props into aria attributes because
// that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`
const ARIA_REGEX = /^aria/;
const CAMEL_REGEX = /-([a-z])/g;

type AriaPropMap = Record<string, any>;

const nodeToAriaPropertyValuesMap: WeakMap<HTMLElement, AriaPropMap> = new WeakMap();
const { hasOwnProperty } = Object.prototype;
const { hasAttribute, setAttribute, removeAttribute, getAttribute } = Element.prototype;
const {
    replace: StringReplace,
    toLowerCase: StringToLowerCase,
    toUpperCase: StringToUpperCase,
} = String.prototype;
const patchedAttributes: Record<string, 1> = Object.create(null);

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
                let newValue = null;
                if (patchedAttributes[attrName]) {
                    const propName = StringReplace.call(attrName, CAMEL_REGEX, (g: string): string => StringToUpperCase.call(g[1]));
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

export function patch(propName: string) {
    const attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
    patchedAttributes[attrName] = 1;
    const descriptor = createAriaPropertyPropertyDescriptor(propName, attrName, null);
    Object.defineProperty(Element.prototype, propName, descriptor);
}
