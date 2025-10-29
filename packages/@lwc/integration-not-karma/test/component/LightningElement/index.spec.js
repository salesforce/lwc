import { LightningElement, createElement, setFeatureFlagForTest } from 'lwc';

import NotInvokingSuper from 'c/notInvokingSuper';
import NotReturningThis from 'c/notReturningThis';
import ParentThrowingBeforeSuper from 'c/parentThrowingBeforeSuper';
import DefinedComponent from 'c/definedComponent';
import UndefinedComponent from 'c/undefinedComponent';
import ReturningBad from 'c/returningBad';

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
    createElement('c-defined-component', { is: DefinedComponent });
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

    const elm = createElement('c-test', { is: Test });
    document.body.appendChild(elm);

    expect(enumerableProperties).toEqual([]);
});

it("should fail when the constructor doesn't invoke super()", () => {
    expect(() => {
        createElement('c-not-invoking-super', { is: NotInvokingSuper });
    }).toThrowError(ReferenceError);
});

it('should fail when the constructor return an instance of LightningElement', () => {
    expect(() => {
        createElement('c-not-returning-this', { is: NotReturningThis });
    }).toThrowError(
        TypeError,
        'Invalid component constructor, the class should extend LightningElement.'
    );
});

it("[W-6981076] shouldn't throw when a component with an invalid child in unmounted", () => {
    const elm = createElement('c-parent-throwing-before-super', { is: ParentThrowingBeforeSuper });

    expect(() => document.body.appendChild(elm)).toThrowCallbackReactionError(
        /Throwing before calling super/
    );
    expect(() => document.body.removeChild(elm)).not.toThrow();
});

it('should fail when the constructor returns something other than LightningElement when DISABLE_LEGACY_VALIDATION is true and LEGACY_LOCKER_ENABLED is falsy', () => {
    setFeatureFlagForTest('DISABLE_LEGACY_VALIDATION', true);
    expect(() => {
        createElement('c-returning-bad', { is: ReturningBad });
    }).toThrowError(
        TypeError,
        'Invalid component constructor, the class should extend LightningElement.'
    );
    setFeatureFlagForTest('DISABLE_LEGACY_VALIDATION', false);
});

it('should succeed when the constructor returns something other than LightningElement when DISABLE_LEGACY_VALIDATION is falsy and LEGACY_LOCKER_ENABLED is falsy', () => {
    expect(() => {
        createElement('c-returning-bad', { is: ReturningBad });
    }).not.toThrow();
});

it('should succeed when the constructor returns something other than LightningElement when DISABLE_LEGACY_VALIDATION is falsy and LEGACY_LOCKER_ENABLED is true', () => {
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);
    expect(() => {
        createElement('c-returning-bad', { is: ReturningBad });
    }).not.toThrow();
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', false);
});

it('should succeed when the constructor returns something other than LightningElement when DISABLE_LEGACY_VALIDATION is true and LEGACY_LOCKER_ENABLED is true', () => {
    setFeatureFlagForTest('DISABLE_LEGACY_VALIDATION', true);
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);
    expect(() => {
        createElement('c-returning-bad', { is: ReturningBad });
    }).not.toThrow();
    setFeatureFlagForTest('DISABLE_LEGACY_VALIDATION', false);
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', false);
});
