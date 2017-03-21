/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

import assert from "./assert.js";
import {
    freeze,
    keys,
    defineProperty,
    getOwnPropertyDescriptor,
} from "./language.js";

const CtorToDefMap = new WeakMap();

// this symbol is a dev-mode artifact to sign the getter/setter per public property
// so we know if they are attempting to access or modify them during construction time.
export const internal = Symbol();

export function getComponentDef(Ctor: Class<Component>): ComponentDef {
    if (CtorToDefMap.has(Ctor)) {
        return CtorToDefMap.get(Ctor);
    }
    assert.isTrue(Ctor.constructor, `Missing ${Ctor.name}.constructor, ${Ctor.name} should have a constructor property.`);
    const name: string = Ctor.name;
    assert.isTrue(name, `${Ctor} should have a name property.`);
    const props = getPropsHash(Ctor);
    const methods = getMethodsHash(Ctor);
    const observedAttrs = getObservedAttrsHash(Ctor);
    const def = {
        name,
        props,
        methods,
        observedAttrs,
    };
    assert.block(() => {
        freeze(def);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
    });
    CtorToDefMap.set(Ctor, def);
    return def;
}

function getPropsHash(target: Object): HashTable<PropDef> {
    const props: HashTable = target.publicProps || {};
    return keys(props).reduce((propsHash: HashTable<PropDef>, propName: string): HashTable<PropDef> => {
        // expanding the property definition
        propsHash[propName] = {
            initializer: props[propName],
        };
        assert.block(() => {
            freeze(propsHash[propName]);
        });
        // initializing getters and setters for each props on the target protype
        let getter;
        let setter;
        assert.block(() => {
            assert.invariant(!getOwnPropertyDescriptor(target.prototype, propName), `Invalid ${target.name}.prototype.${propName} definition, it cannot be defined if it is a public property.`);
            getter = () => {
                assert.fail(`Component <${target.name}> can not access to property ${propName} during construction.`);
            };
            setter = () => {
                assert.fail(`Component <${target.name}> can not set a new value for property ${propName}.`);
            };
            defineProperty(getter, internal, { value: true, configurable: false, writable: false, enumerable: false });
            defineProperty(setter, internal, { value: true, configurable: false, writable: false, enumerable: false });
        });
        // setting up the descriptor for the public prop
        defineProperty(target.prototype, propName, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
        return propsHash;
    }, {});
}

function getMethodsHash(target: Object): HashTable<number> {
    return (target.publicMethods || []).reduce((methodsHash: HashTable, methodName: string): HashTable => {
        methodsHash[methodName] = 1;
        assert.block(() => {
            assert.isTrue(typeof target.prototype[methodName] === 'function', `<${target.name}>.${methodName} have to be a function.`);
            freeze(target.prototype[methodName]);
            // setting up the descriptor for the public method
            defineProperty(target.prototype, methodName, {
                configurable: false,
                enumerable: false,
                writable: false,
            });
        });
        return methodsHash;
    }, {});
}

function getObservedAttrsHash(target: Object): HashTable<number> {
    return (target.observedAttributes || []).reduce((observedAttributes: HashTable, attrName: string): HashTable => {
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, {});
}
