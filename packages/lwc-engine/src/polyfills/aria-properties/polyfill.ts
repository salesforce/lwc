import { setAttribute, removeAttribute, getAttribute, hasAttribute } from '../../env/element';

// this regular expression is used to transform aria props into aria attributes because
// that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`
const ARIA_REGEX = /^aria/;

type AriaPropMap = Record<string, any>;

const nodeToAriaPropertyValuesMap: WeakMap<HTMLElement, AriaPropMap> = new WeakMap();
const { hasOwnProperty } = Object.prototype;
const {
    replace: StringReplace,
    toLowerCase: StringToLowerCase,
} = String.prototype;

function getAriaPropertyMap(elm: HTMLElement): AriaPropMap {
    let map = nodeToAriaPropertyValuesMap.get(elm);
    if (map === undefined) {
        map = { host: {}, sr: {} };
        nodeToAriaPropertyValuesMap.set(elm, map);
    }
    return map;
}

function getNormalizedAriaPropertyValue(propName: string, value: any): any {
    return value == null ? null : value + '';
}

function createAriaPropertyPropertyDescriptor(propName: string, attrName: string): PropertyDescriptor {
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
    const descriptor = createAriaPropertyPropertyDescriptor(propName, attrName);
    Object.defineProperty(Element.prototype, propName, descriptor);
}
