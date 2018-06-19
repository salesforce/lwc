import assert from '../assert';
import {
    create,
    hasOwnProperty,
    isUndefined,
    isNull,
    ArrayReduce,
} from '../language';
import { getAttrNameFromPropName } from "../attributes";
import { VM, getCustomElementVM, getShadowRootVM } from '../vm';
import { removeAttribute, setAttribute } from './element';
import { ElementAOMPropertyNames } from '../attributes';

// internal record used to quickly match an attribute name to the aom property name if correspond
let AOMAttrNameToPropNameMap: Record<string, string>;

function creatAOMInternalRecord() {
    if (isUndefined(AOMAttrNameToPropNameMap)) {
        // Note: lazy creation to avoid circular deps errors
        AOMAttrNameToPropNameMap = ArrayReduce.call(ElementAOMPropertyNames, (seed: Record<string, string>, propName: string) => {
            seed[getAttrNameFromPropName(propName)] = propName;
            return seed;
        }, create(null));
    }
}

function createShadowRootAOMPropertyDescriptor(propName: string, attrName: string, defaultValue: any): PropertyDescriptor {
    return {
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
        },
        configurable: true,
        enumerable: true,
    };
}

// Synthetic creation of all AOM property descriptors for Shadow Roots
export function createShadowRootAOMDescriptorMap(): PropertyDescriptorMap {
    creatAOMInternalRecord();
    return ArrayReduce.call(ElementAOMPropertyNames, (seed: PropertyDescriptorMap, propName: string) => {
        seed[propName] = createShadowRootAOMPropertyDescriptor(propName, getAttrNameFromPropName(propName), null);
        return seed;
    }, create(null));
}

export function attemptAriaAttributeFallback(vm: VM, attrName: string) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // if the map is known (because all AOM attributes are known)
    if (hasOwnProperty.call(AOMAttrNameToPropNameMap, attrName)) {
        const propName = AOMAttrNameToPropNameMap[attrName];
        vm.hostAttrs[attrName] = undefined; // marking the set is needed for the AOM polyfill
        const shadowValue = vm.cmpRoot![propName];
        if (shadowValue !== null) {
            setAttribute.call(vm.elm, attrName, shadowValue);
        }
    }
}

export function createCustomElementAOMPropertyDescriptor(propName: string, attrName: string, defaultValue: any): PropertyDescriptor {
    return {
        get(this: HTMLElement) {
            const vm =  getCustomElementVM(this);
            if (!hasOwnProperty.call(vm.cmpProps, propName)) {
                return null;
            }
            return vm.cmpProps[propName];
        },
        set(this: HTMLElement, newValue: any) {
            // TODO: fallback to the root's AOM default semantics
            const vm =  getCustomElementVM(this);
            const value = vm.cmpProps[propName] = isNull(newValue) ? null : newValue + ''; // storing the normalized new value
            if (isNull(value)) {
                // Go through cmpRoot instead of vm.rootProps
                // because vm.cmpRoot also handles default values
                newValue = vm.cmpRoot[propName];
                vm.hostAttrs[attrName] = undefined;
            } else {
                vm.hostAttrs[attrName] = 1;
            }
            if (isNull(newValue)) {
                removeAttribute.call(this, attrName);
            } else {
                setAttribute.call(this, attrName, newValue);
            }
        },
        configurable: true,
        enumerable: true,
    };
}
