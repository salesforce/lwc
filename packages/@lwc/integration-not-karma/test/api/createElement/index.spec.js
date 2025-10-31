import { createElement, LightningElement, setFeatureFlagForTest } from 'lwc';

import Test from 'c/test';
import ShadowRootGetter from 'c/shadowRootGetter';
import {
    isNativeShadowRootInstance,
    isSyntheticShadowRootInstance,
} from '../../../helpers/utils.js';

function testInvalidOptions(type, option) {
    it(`throws a TypeError if option is a ${type}`, () => {
        expect(() => createElement('c-component', option)).toThrowError(
            TypeError,
            /"createElement" function expects an object as second parameter but received/
        );
    });
}

testInvalidOptions('undefined', undefined);
testInvalidOptions('null', null);
testInvalidOptions('String', 'c-component');
testInvalidOptions('Class not extending LightningElement', class Component {});

function testInvalidIsValue(type, isValue) {
    it(`throws a TypeError if option.is is a ${type}`, () => {
        expect(() => createElement('c-component', { is: isValue })).toThrowError(
            TypeError,
            '"createElement" function expects an "is" option with a valid component constructor.'
        );
    });
}

testInvalidIsValue('undefined', undefined);
testInvalidIsValue('null', null);
testInvalidIsValue('String', 'c-component');

function testInvalidComponentConstructor(type, isValue) {
    it(`throws a TypeError if option.is is a ${type}`, () => {
        expect(() => createElement('c-component', { is: isValue })).toThrowError(
            TypeError,
            /.+ is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration./
        );
    });
}

testInvalidComponentConstructor('Function', function () {});
testInvalidComponentConstructor('Class not extending LightningElement', class Component {});

it('returns an HTMLElement', () => {
    const elm = createElement('c-component', { is: Test });
    expect(elm instanceof HTMLElement).toBe(true);
});

it.skipIf(process.env.NATIVE_SHADOW)(
    'should create an element with a synthetic shadow root by default',
    () => {
        const elm = createElement('c-component', { is: Test });
        expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
        expect(elm.isSynthetic()).toBeTrue();
    }
);

it('supports component constructors in circular dependency', () => {
    function Circular() {
        return Test;
    }
    Circular.__circular__ = true;

    const elm = createElement('c-component', { is: Circular });
    expect(elm instanceof HTMLElement).toBe(true);
});

describe.runIf(process.env.NATIVE_SHADOW)('native shadow', () => {
    it('should create an element with a native shadow root if fallback is false', () => {
        const elm = createElement('c-component', { is: Test });
        expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
        expect(elm.isSynthetic()).toBeFalse();
    });

    it('should create a shadowRoot in open mode when mode in not specified', () => {
        const elm = createElement('c-component', {
            is: Test,
        });
        expect(elm.shadowRoot.mode).toBe('open');
    });

    it('should create a shadowRoot in closed mode if the mode is passed as closed', () => {
        const elm = createElement('c-shadow-root-getter', {
            is: ShadowRootGetter,
            mode: 'closed',
        });

        // Since the shadowRoot property is not attached to the element in closed mode, we need to
        // retrieve it by accessing the template property from the class.
        const shadowRoot = elm.getShadowRoot();

        expect(shadowRoot).toBeInstanceOf(ShadowRoot);
        expect(shadowRoot.mode).toBe('closed');
    });
});

describe('locker integration', () => {
    beforeEach(() => {
        setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', false);
    });
    it('should support component class that extend a mirror of the LightningElement', () => {
        function SecureBaseClass() {
            if (this instanceof SecureBaseClass) {
                LightningElement.prototype.constructor.call(this);
            } else {
                return SecureBaseClass;
            }
        }
        SecureBaseClass.__circular__ = true;

        class Component extends SecureBaseClass {}
        const elm = createElement('c-component', { is: Component });
        expect(elm instanceof HTMLElement).toBe(true);
    });
});
