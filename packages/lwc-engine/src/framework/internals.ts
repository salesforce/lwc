import { ElementPrototypeAriaPropertyNames } from '../polyfills/aria-properties/main';
import { defineProperties, isUndefined, getOwnPropertyDescriptor, create, ArrayReduce } from '../shared/language';
import { ViewModelReflection } from './utils';
import { setInternalField, getInternalField } from '../shared/fields';
import { VM } from './vm';

/**
 * This class implements the web component's internals, which give component's
 * authors access to internals like default values for tabIndex, AOM properties
 * and others. More details about this new API:
 * - https://github.com/w3c/webcomponents/issues/758
 *
 * NOTE: Although the API to create the internals instance is not well defined,
 * in LWC we do not plan to open that API, just lke we don't allow authors to
 * attachShadow(), and instead, LightingElement abstraction will take care of
 * those steps. That is why it is safe to move forward with exposing `this.internals`.
 */
export class ComponentInternals {
    constructor(vm) {
        setInternalField(this, ViewModelReflection, vm);
    }
}

/**
 * All aria properties and role are accessible via internals, and will be
 * analog to just change the property on the host directly.
 */
const AOMInternalsDescriptorMap = ArrayReduce.call(ElementPrototypeAriaPropertyNames, (seed: PropertyDescriptorMap, propName: string) => {
    const descriptor = getOwnPropertyDescriptor(Element.prototype, propName);
    if (!isUndefined(descriptor)) {
        seed[propName] = {
            get(this: ComponentInternals): any {
                const vm: VM = getInternalField(this, ViewModelReflection);
                return descriptor.get!.call(vm.elm);
            },
            set(this: ComponentInternals, newValue: any) {
                const vm: VM = getInternalField(this, ViewModelReflection);
                descriptor.set!.call(vm.elm, newValue);
            },
            configurable: true,
            enumerable: true,
        };
    }
    return seed;
}, create(null));

defineProperties(ComponentInternals.prototype, AOMInternalsDescriptorMap);
