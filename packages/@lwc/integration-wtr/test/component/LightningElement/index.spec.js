import { LightningElement, createElement, setFeatureFlagForTest } from 'lwc';

import NotInvokingSuper from 'x/notInvokingSuper';
import NotReturningThis from 'x/notReturningThis';
import ParentThrowingBeforeSuper from 'x/parentThrowingBeforeSuper';
import DefinedComponent from 'x/definedComponent';
import UndefinedComponent from 'x/undefinedComponent';
import ReturningIframe from 'x/returningIframe';
import ReturningEmbed from 'x/returningEmbed';
import ReturningObject from 'x/returningObject';
import ReturningScript from 'x/returningScript';

it('should throw when trying to invoke the constructor manually', () => {
    const func = () => {
        new LightningElement();
    };
    expect(func).toThrowError(TypeError);
    expect(func).toThrowError(/Illegal constructor/);
});

it('should throw when trying to `new` a subclass of LightningElement manually', () => {
    const func = () => {
        class Test extends LightningElement {}
        new Test();
    };
    expect(func).toThrowError(TypeError);
    expect(func).toThrowError(/Illegal constructor/);
});

it('should throw when trying to `new` a compiled subclass of LightningElement', () => {
    const func = () => {
        new UndefinedComponent();
    };
    expect(func).toThrowError(TypeError);
    expect(func).toThrowError(/Illegal constructor/);
});

// TODO [#2970]: component constructor cannot be new-ed even after being defined
it('should throw when trying to `new` a compiled subclass of LightningElement after definition', () => {
    createElement('x-defined-component', { is: DefinedComponent });
    const func = () => {
        new DefinedComponent();
    };
    expect(func).toThrowError(TypeError);
    expect(func).toThrowError(/Illegal constructor/);
});

it('should have no property enumerable on the component instance', () => {
    let enumerableProperties = [];

    class Test extends LightningElement {
        connectedCallback() {
            enumerableProperties = Object.keys(this);
        }
    }

    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(enumerableProperties).toEqual([]);
});

it("should fail when the constructor doesn't invoke super()", () => {
    expect(() => {
        createElement('x-not-invoking-super', { is: NotInvokingSuper });
    }).toThrowError(ReferenceError);
});

it('should fail when the constructor return an instance of LightningElement', () => {
    expect(() => {
        createElement('x-not-returning-this', { is: NotReturningThis });
    }).toThrowError(
        TypeError,
        'Invalid component constructor, the class should extend LightningElement.'
    );
});

it("[W-6981076] shouldn't throw when a component with an invalid child in unmounted", () => {
    const elm = createElement('x-parent-throwing-before-super', { is: ParentThrowingBeforeSuper });

    expect(() => document.body.appendChild(elm)).toThrowCallbackReactionError(
        /Throwing before calling super/
    );
    expect(() => document.body.removeChild(elm)).not.toThrow();
});

const DANGEROUS_ELEMENT_CASES = [
    ['iframe', ReturningIframe, 'x-returning-iframe'],
    ['embed', ReturningEmbed, 'x-returning-embed'],
    ['object', ReturningObject, 'x-returning-object'],
    ['script', ReturningScript, 'x-returning-script'],
];

DANGEROUS_ELEMENT_CASES.forEach(([tagName, Component, tag]) => {
    it(`should fail when the constructor returns a dangerous element (${tagName}) when DISABLE_ENHANCED_CONSTRUCTOR_VALIDATION is true`, () => {
        // Make sure the flag is off
        setFeatureFlagForTest('DISABLE_ENHANCED_CONSTRUCTOR_VALIDATION', false);
        expect(() => {
            createElement(tag, { is: Component });
        }).toThrowError(
            TypeError,
            'Invalid component constructor, the class should extend LightningElement.'
        );
    });

    it('should succeed when the constructor returns a dangerous element (${tagName}) when DISABLE_ENHANCED_CONSTRUCTOR_VALIDATION is true (legacy check)', () => {
        setFeatureFlagForTest('DISABLE_ENHANCED_CONSTRUCTOR_VALIDATION', true);
        expect(() => {
            createElement(tag, { is: Component });
        }).not.toThrow();
        setFeatureFlagForTest('DISABLE_ENHANCED_CONSTRUCTOR_VALIDATION', false);
    });
});
