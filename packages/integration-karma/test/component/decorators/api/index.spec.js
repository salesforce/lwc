import { createElement } from 'lwc';

import Properties from 'x/properties';
import Mutate from 'x/mutate';
import GetterSetter from 'x/getterSetter';
import ConstructorGetterAccess from 'x/constructorGetterAccess';
import Reactivity from 'x/reactivity';
import Methods from 'x/methods';
import Inheritance from 'x/inheritance';
import NullInitialValue from 'x/nullInitialValue';

describe('properties', () => {
    it('should expose class properties with the api decorator', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        expect(elm.publicProp).toBeDefined();
        expect(elm.privateProp).toBeUndefined();
    });

    it('should make the public property reactive if used in the template', () => {
        const elm = createElement('x-reactive', { is: Reactivity });
        document.body.appendChild(elm);

        expect(elm.getRenderCount()).toBe(1);

        elm.reactive = 'reactive';
        return Promise.resolve().then(() => {
            expect(elm.getRenderCount()).toBe(2);
        });
    });

    it('should make the public property not reactive if not used in the template', () => {
        const elm = createElement('x-reactive', { is: Reactivity });
        document.body.appendChild(elm);

        expect(elm.getRenderCount()).toBe(1);

        elm.nonReactive = 'reactive';
        return Promise.resolve().then(() => {
            expect(elm.getRenderCount()).toBe(1);
        });
    });

    it('throws an error when attempting set a property of a public property', () => {
        const elm = createElement('x-mutate', { is: Mutate });
        elm.publicProp = { x: 0 };
        document.body.appendChild(elm);

        expect(() => {
            elm.mutateCmp((cmp) => {
                cmp.publicProp.x = 1;
            });
        }).toThrowError();
    });
});

describe('getter/setter', () => {
    it('should expose public getters and setters', () => {
        const elm = createElement('x-getter-setter', { is: GetterSetter });

        elm.publicAccessor = 'test';
        expect(elm.publicAccessor).toBe('test:setter:getter');
    });

    it('should allow calling the getter and setter during construction', () => {
        expect(() => {
            createElement('x-constructor-getter-access', { is: ConstructorGetterAccess });
        }).not.toThrow();
    });
});

describe('methods', () => {
    it('should only expose methods with the api decorator', () => {
        const elm = createElement('x-methods', { is: Methods });

        expect(elm.publicMethod).toBeDefined();
        expect(elm.privateMethod).toBeUndefined();
    });

    it('should invoke the method with the right this value and arguments', () => {
        const param = {};
        const elm = createElement('x-methods', { is: Methods });

        const { thisValue, args } = elm.publicMethod(param);
        expect(thisValue instanceof Methods).toBe(true);
        expect(args).toEqual([param]);
    });
});

describe('inheritance', () => {
    it('should inherit the public props from the base class', () => {
        const elm = createElement('x-inheritance', { is: Inheritance });

        expect(elm.base).toBe('base');
        expect(elm.child).toBe('child');
        expect(elm.overridden).toBe('overridden - child');
    });

    it('should inherit the public methods from the base class', () => {
        const elm = createElement('x-inheritance', { is: Inheritance });

        expect(elm.baseMethod()).toBe('base');
        expect(elm.childMethod()).toBe('child');
        expect(elm.overriddenMethod()).toBe('overridden - child');
    });
});

it('should not log an error when initializing api value to null', () => {
    const elm = createElement('x-foo-init-api', { is: NullInitialValue });

    expect(() => document.body.appendChild(elm)).not.toLogErrorDev();
});
