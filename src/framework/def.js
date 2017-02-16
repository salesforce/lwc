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
const CAPS_REGEX = /[A-Z]/g;

// this symbol is a dev-mode artifact to sign the getter/setter per public property
// so we know if they are attempting to access or modify them during construction time.
export const internal = Symbol();

export function getComponentDef(Ctor: Class<Component>): ComponentDef {
    if (CtorToDefMap.has(Ctor)) {
        return CtorToDefMap.get(Ctor);
    }
    assert.isTrue(Ctor.constructor, `Missing ${Ctor.name}.constructor, ${Ctor.name} should have a constructor property.`);
    const name: string = Ctor.constructor && Ctor.constructor.name;
    assert.isTrue(name, `Missing ${Ctor.name}.constructor.name, ${Ctor.name}.constructor should have a name property.`);
    const props = getPropsHash(Ctor);
    const attrs = getAttrsHash(props);
    const methods = getMethodsHash(Ctor);
    const observedAttrs = getObservedAttrsHash(Ctor, attrs);
    const def = {
        name,
        props,
        attrs,
        methods,
        observedAttrs,
    };
    assert.block(() => {
        freeze(def);
        freeze(props);
        freeze(attrs);
        freeze(methods);
        freeze(observedAttrs);
    });
    CtorToDefMap.set(Ctor, def);
    return def;
}

function getPropsHash(target: Object): HashTable<PropDef> {
    const props: HashTable = target.publicProps || {};
    return keys(props).reduce((propsHash: HashTable, propName: string) => {
        // expanding the property definition
        propsHash[propName] = {
            initializer: props[propName],
            attrName: propName.replace(CAPS_REGEX, (match: string): string => '-' + match.toLowerCase()),
        };
        assert.block(() => {
            freeze(propsHash[propName]);
        });
        // initializing getters and setters for each props on the target protype
        let getter;
        let setter;
        assert.block(() => {
            assert.invariant(!getOwnPropertyDescriptor(target.prototype, propName), `Invalid ${target.constructor.name}.prototype.${propName} definition, it cannot be defined if it is a public property.`);
            getter = () => {
                assert.fail(`Component <${target.constructor.name}> can not access to property ${propName} during construction.`);
            };
            setter = () => {
                assert.fail(`Component <${target.constructor.name}> can not set a new value for property ${propName}.`);
            };
            defineProperty(getter, internal, { value: true, configurable: false, writtable: false, enumerable: false });
            defineProperty(setter, internal, { value: true, configurable: false, writtable: false, enumerable: false });
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

function getAttrsHash(props: HashTable<PropDef>): HashTable<AttrDef> {
    return keys(props).reduce((attrsHash: HashTable<AttrDef>, propName: string): HashTable => {
        attrsHash[props[propName].attrName] = {
            propName: propName,
        };
        return attrsHash;
    }, {});
}

function getMethodsHash(target: Object): HashTable<number> {
    return (target.publicMethods || []).reduce((methodsHash: HashTable, methodName: string): HashTable => {
        methodsHash[methodName] = 1;
        assert.block(() => {
            assert.isTrue(typeof target.prototype[methodName] === 'function', `<${target.constructor.name}>.${methodName} have to be a function.`);
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

function getObservedAttrsHash(target: Object, attrs: HashTable<AttrDef>): HashTable<number> {
    return (target.observedAttributes || []).reduce((observedAttributes: HashTable, attrName: string): HashTable => {
        observedAttributes[attrName] = 1;
        assert.block(() => {
            assert.isTrue(attrs[attrName], `Invalid attribute ${attrName} in ${target}.observedAttributes.`);
        });
        return observedAttributes;
    }, {});
}
