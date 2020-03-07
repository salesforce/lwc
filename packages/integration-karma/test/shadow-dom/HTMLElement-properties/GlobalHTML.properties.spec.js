import { createElement } from 'lwc';

import Test from 'x/test';
import Parent from 'x/parent';
import TabIndexTester from 'x/tabIndexTester';
import TabIndexSetInConnectedCallback from 'x/tabIndexSetInConnectedCallback';
import TabIndexSetInRender from 'x/tabIndexSetInRender';
import TabIndexSetInConstructor from 'x/tabIndexSetInConstructor';
import NonReflectedTabIndex from 'x/nonReflectedTabIndex';
import ReflectedTabIndex from 'x/reflectedTabIndex';
import SetAttribute from 'x/setAttribute';
import AccessAttributeInConstructor from 'x/accessAttributeInConstructor';

describe('global HTML Properties', () => {
    it('should return null during construction', () => {
        const elm = createElement('x-foo', { is: Test });
        elm.setAttribute('title', 'cubano');
        const cmp = elm.componentInstance;
        expect(cmp.titleAttributeAtConstruction).toBeNull();
        expect(cmp.getAttribute('title')).toBe('cubano');
    });

    it('should set user specified value during setAttribute call', () => {
        const elm = createElement('x-foo', { is: Test });
        elm.setAttribute('tabindex', '0');
        document.body.appendChild(elm);
        const cmp = elm.componentInstance;
        expect(cmp.getAttribute('tabindex')).toBe('0');
    }),
        it('should not throw when accessing attribute in root elements', () => {
            const elm = createElement('x-foo', { is: Test });
            document.body.appendChild(elm);
            elm.setAttribute('tabindex', 1);
        });

    it('should delete existing attribute prior rendering', () => {
        const elm = createElement('x-foo', { is: Test });
        elm.setAttribute('title', 'parent title');
        elm.removeAttribute('title');
        document.body.appendChild(elm);

        expect(elm.getAttribute('title')).not.toBe('parent title');
    });
});

describe('#tabIndex', function() {
    it('should have a valid value during connectedCallback', function() {
        const elm = createElement('x-foo', { is: TabIndexTester });
        elm.setAttribute('tabindex', 3);
        document.body.appendChild(elm);
        expect(elm.tabIndexInConnectedCallback).toBe(3);
    });

    it('should have a valid value after initial render', function() {
        const elm = createElement('x-foo', { is: TabIndexTester });
        elm.setAttribute('tabindex', 3);
        document.body.appendChild(elm);

        expect(elm.getTabIndex()).toBe(3);
    });

    it('should set tabindex correctly', function() {
        const elm = createElement('x-foo', { is: TabIndexSetInConnectedCallback });
        elm.setAttribute('tabindex', 3);
        document.body.appendChild(elm);

        expect(elm.tabIndex).toBe(2);
        expect(elm.getTabIndex()).toBe(2);
    });

    it('should not trigger render cycle', function() {
        const elm = createElement('x-foo', { is: TabIndexSetInConnectedCallback });
        elm.setAttribute('tabindex', 3);
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(elm.renderCount).toBe(1);
        });
    });

    it('should allow parent component to overwrite internally set tabIndex', function() {
        const elm = createElement('x-foo', { is: TabIndexSetInConnectedCallback });
        elm.setAttribute('tabindex', 3);
        document.body.appendChild(elm);
        elm.setAttribute('tabindex', 4);

        expect(elm.tabIndex).toBe(4);
        expect(elm.getTabIndex()).toBe(4);
    });

    it('should throw if setting tabIndex during render', function() {
        const elm = createElement('x-foo', { is: TabIndexSetInRender });
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowErrorDev(Error, /render\(\) method has side effects on the state of/);
    });

    it('should throw if setting tabIndex during construction', function() {
        expect(() => {
            createElement('x-foo', { is: TabIndexSetInConstructor });
        }).toThrowErrorDev(Error, /The result must not have attributes./);
    });

    it('should not throw when tabIndex is not reflected to element', () => {
        const elm = createElement('x-foo', { is: NonReflectedTabIndex });
        document.body.appendChild(elm);
        expect(() => {
            elm.tabIndex = -1;
        }).not.toThrow();
    });

    it('should not throw when tabIndex is reflected to element', () => {
        const elm = createElement('x-foo', { is: ReflectedTabIndex });
        document.body.appendChild(elm);
        expect(() => {
            elm.tabIndex = -1;
        }).not.toThrow();
    });
});

it('should set user specified value during setAttribute call', () => {
    const elm = createElement('x-foo', { is: SetAttribute });
    elm.setAttribute('tabindex', '0');
    document.body.appendChild(elm);

    expect(elm.userDefinedTabIndexValue).toBe('0');
});

it('should log console error accessing props in constructor', () => {
    expect(() => {
        createElement('prop-setter-title', { is: AccessAttributeInConstructor });
    }).toLogErrorDev(
        /\[LWC error\]: `HTMLBridgeElement` constructor can't read the value of property `title` because the owner component hasn't set the value yet. Instead, use the `HTMLBridgeElement` constructor to set a default value for the property./
    );
});

it('should not log error message when arbitrary attribute is set via elm.setAttribute', () => {
    const elm = createElement('x-foo', { is: Test });
    expect(() => {
        elm.setAttribute('foo', 'something');
        document.body.appendChild(elm);
    }).not.toLogErrorDev();
});

it('should delete existing attribute prior rendering', () => {
    const elm = createElement('x-foo', { is: Test });
    elm.setAttribute('title', 'parent title');
    elm.removeAttribute('title');
    document.body.appendChild(elm);

    expect(elm.getAttribute('title')).not.toBe('parent title');
});

it('should correctly set child attribute', () => {
    const parentElm = createElement('x-parent', { is: Parent });
    parentElm.setAttribute('title', 'parent title');
    document.body.appendChild(parentElm);
    const childElm = parentElm.shadowRoot.querySelector('x-test');

    expect(childElm.getAttribute('title')).toBe('child title');
});
