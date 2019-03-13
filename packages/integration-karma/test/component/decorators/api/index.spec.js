import { createElement } from 'test-utils';

import Properties from 'x/properties';
import ConstructorPropertyAccess from 'x/constructorPropertyAccess';
import ManualMutation from 'x/manualMutation';
import Mutate from 'x/mutate';
import GetterSetter from 'x/getterSetter';
import ConstructorGetterAccess from 'x/constructorGetterAccess';
import Reactivity from 'x/reactivity';
import Methods from 'x/methods';
import Inheritance from 'x/inheritance';

describe('properties', () => {
    it('should expose class properties with the api decorator', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        expect(elm.publicProp).toBeDefined();
        expect(elm.privateProp).toBeUndefined();
    });

    it('logs an error when attempting to read a public property during construction', () => {
        expect(() => {
            createElement('x-constructor-get', { is: ConstructorPropertyAccess });
        }).toLogErrorDev(
            /\[.+\] constructor should not read the value of property "prop"\. The owner component has not yet set the value\. Instead use the constructor to set default values for properties\./
        );
    });

    it('logs a warning when attempting to set a non trackable value', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        expect(() => {
            elm.publicProp = new Map();
        }).toLogWarningDev(
            /Assigning a non-reactive value \[.+\] to member property publicProp of \[.+\] is not common because mutations on that value cannot be observed\./
        );
    });

    it('logs a warning when attempting to set a public property manually', () => {
        const elm = createElement('x-manual-mutation', { is: ManualMutation });
        document.body.appendChild(elm);

        expect(() => {
            elm.setPropertyManually('manual');
        }).toLogWarningDev(
            /If property publicProp decorated with @api in \[.+\] is used in the template, the value manual set manually may be overridden by the template, consider binding the property only in the template\./
        );
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

    // TODO: salesforce/observable-membrane#28 - ReadOnly membrane doesn't throw when mutating a value on JavascriptCore
    xit('throws an error when attempting a property of a public property', () => {
        const elm = createElement('x-mutate', { is: Mutate });
        elm.publicProp = { x: 0 };
        document.body.appendChild(elm);

        expect(() => {
            elm.mutateCmp(cmp => {
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

    it('logs a warning when attempting to set a public accessor manually', () => {
        const elm = createElement('x-manual-mutation', { is: ManualMutation });
        document.body.appendChild(elm);

        expect(() => {
            elm.setAccessorManually('manual');
        }).toLogWarningDev(
            /If property publicAccessor decorated with @api in \[.+\] is used in the template, the value manual set manually may be overridden by the template, consider binding the property only in the template\./
        );
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
