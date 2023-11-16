import { createElement } from 'lwc';
import XWithoutChildren from 'x/withoutChildren';
import XWithChildren from 'x/withChildren';
import XWithDeclarativeEvent from 'x/withDeclarativeEvent';
import XWithDelayedUpgrade from 'x/withDelayedUpgrade';
import XWithDifferentViews from 'x/withDifferentViews';
import XWithImperativeEvent from 'x/withImperativeEvent';
import XWithProperty from 'x/withProperty';
import XWithCamelCaseProperty from 'x/withCamelCaseProperty';
import XWithUnregisteredWC from 'x/withUnregisteredWC';

import './custom-elements/ce-without-children';
import './custom-elements/ce-with-children';
import './custom-elements/ce-with-event';
import './custom-elements/ce-with-property';
import './custom-elements/ce-with-camel-case-property';

const unknownPropTokyo =
    /Error: \[LWC warn]: Unknown public property "tokyo" of element <ce-with-property>\. This is either a typo on the corresponding attribute "tokyo", or the attribute does not exist in this browser or DOM implementation\./;

describe('lwc:external directive basic tests', () => {
    it('should render a Custom Element without children', () => {
        const elm = createElement('x-without-children', { is: XWithoutChildren });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('ce-without-children')).not.toBeNull();
    });

    it('should render a Custom Element with children', () => {
        const elm = createElement('x-with-children', { is: XWithChildren });
        document.body.appendChild(elm);

        const ce = elm.shadowRoot.querySelector('ce-with-children');
        const heading = ce.shadowRoot.querySelector('h1');
        expect(heading).not.toBeNull();
        expect(heading.textContent).toBe('Test h1');
        const paragraph = ce.shadowRoot.querySelector('p');
        expect(paragraph).not.toBeNull();
        expect(paragraph.textContent).toBe('Test p');

        const slotContent = ce.shadowRoot.querySelector('slot').assignedNodes();
        expect(slotContent.length).toBe(1);
        expect(slotContent[0].textContent).toBe('slot content');
    });

    it('should render a Custom Element and handle hiding and showing the element', () => {
        const elm = createElement('x-with-different-views', { is: XWithDifferentViews });
        document.body.appendChild(elm);

        let ce = elm.shadowRoot.querySelector('ce-with-children');
        expect(ce).toBeNull();

        elm.showWC = true;
        return Promise.resolve().then(() => {
            ce = elm.shadowRoot.querySelector('ce-with-children');
            expect(ce).not.toBeNull();
        });
    });

    it('should imperatively listen to a DOM event dispatched by a Custom Element', () => {
        const elm = createElement('x-with-imperative-event', { is: XWithImperativeEvent });
        document.body.appendChild(elm);

        const handled = elm.shadowRoot.querySelector('div');
        expect(handled.textContent).toBe('false');

        const ce = elm.shadowRoot.querySelector('ce-with-event');
        ce.click();
        return Promise.resolve().then(() => {
            expect(handled.textContent).toBe('true');
        });
    });

    it('should declaratively listen to a DOM event dispatched by a Custom Element', () => {
        const elm = createElement('x-with-declarative-event', { is: XWithDeclarativeEvent });
        document.body.appendChild(elm);

        const handled = elm.shadowRoot.querySelector('div');
        expect(handled.textContent).toBe('false');

        const ce = elm.shadowRoot.querySelector('ce-with-event');
        ce.click();
        return Promise.resolve().then(() => {
            expect(handled.textContent).toBe('true');
        });
    });

    it('should use unresolved HTMLElement if Custom Element is not registered', () => {
        const elm = createElement('x-with-unregsitered-wc', { is: XWithUnregisteredWC });
        document.body.appendChild(elm);

        const ce = elm.shadowRoot.querySelector('ce-not-registered');
        expect(ce).not.toBeNull();
        expect(ce instanceof HTMLElement).toBe(true);
        expect(customElements.get('ce-not-registered')).toBe(undefined);
    });

    it('should distribute slotted content', () => {
        const elm = createElement('x-with-children', { is: XWithChildren });
        document.body.appendChild(elm);

        const ce = elm.shadowRoot.querySelector('ce-with-children');
        const div = elm.shadowRoot.querySelector('.slotted');
        const slot = ce.shadowRoot.querySelector('slot');

        expect(div.assignedSlot).toBe(slot);
        expect(slot.assignedElements().includes(div)).toBeTruthy();
    });

    describe('passing objects as data', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('x-with-property', { is: XWithProperty });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarningDev(unknownPropTokyo);
        });

        it('should be stringified when set as an attribute', () => {
            elm.data = {};

            return Promise.resolve().then(() => {
                const ce = elm.shadowRoot.querySelector('ce-with-property');
                expect(ce.getAttribute('attr')).toBe('[object Object]');
            });
        });

        it('should pass object without stringifying', () => {
            const obj = {};
            elm.data = obj;

            return Promise.resolve().then(() => {
                const ce = elm.shadowRoot.querySelector('ce-with-property');
                expect(ce.prop).toEqual(obj);
            });
        });
    });

    it('should work with lwc:spread', () => {
        const elm = createElement('x-with-property', { is: XWithProperty });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogWarningDev(unknownPropTokyo);

        return Promise.resolve().then(() => {
            const ce = elm.shadowRoot.querySelector('ce-with-property');
            expect(ce.kyoto).toBe('kamogawa river');
            expect(ce.osaka).toBe('yodogawa river');
            expect(ce.tokyo).toBe('tamagawa');
        });
    });

    it('should work with camel case properties', async () => {
        const elm = createElement('x-with-camel-case-property', { is: XWithCamelCaseProperty });
        const propValue = '-1';
        elm.prop = propValue;
        document.body.appendChild(elm);
        await Promise.resolve();
        const ce = elm.shadowRoot.querySelector('ce-with-camel-case-property');
        expect(ce.camelCaseProp).toBe(propValue);
        expect(ce.hasAttribute('camel-case-prop')).toBe(false);
        expect(ce.getAttribute('not-a-prop')).toBe(propValue);
        expect(ce.getAttribute('aria-label')).toBe(propValue);
        if (process.env.NATIVE_SHADOW) {
            expect(ce.getAttribute('aria-labelledby')).toBe(propValue);
        } else {
            expect(ce.getAttribute('aria-labelledby')).toMatch(new RegExp(`^${propValue}`));
        }
        expect(ce.getAttribute('tabindex')).toBe(propValue);
    });

    describe('when custom element not upgraded', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('x-with-unregsitered-wc', { is: XWithUnregisteredWC });
            document.body.appendChild(elm);
        });

        it('should set only attributes on mount', () => {
            return Promise.resolve().then(() => {
                const ce = elm.shadowRoot.querySelector('ce-not-registered');
                expect(ce.getAttribute('attr')).toBe('default');
                expect(elm.attr).toBeUndefined();
            });
        });

        it('should set only attributes on update', () => {
            elm.data = 'apple';
            return Promise.resolve().then(() => {
                const ce = elm.shadowRoot.querySelector('ce-not-registered');
                expect(ce.getAttribute('attr')).toBe('apple');
                expect(ce.attr).toBeUndefined();
            });
        });
    });

    describe('delayed upgrade', () => {
        // This test is not broken up into smaller ones with individual assertions because we
        // cannot manage the order in which different tests run. Order is important because once
        // you define a custom element, there is no way to undefine it and the assertions meant
        // for before the upgrade must run first.
        it('should set property instead of attribute', async () => {
            const elm = createElement('x-with-delayed-upgrade', { is: XWithDelayedUpgrade });
            document.body.appendChild(elm);
            const ce = elm.shadowRoot.querySelector('ce-with-delayed-upgrade');

            elm.data = 'sake';
            await Promise.resolve();

            expect(ce.shadowRoot).toBeNull();
            expect(ce.getAttribute('foo')).toBe('sake');
            expect(ce.foo).toBeUndefined();

            elm.upgrade();

            elm.data = 'miso';
            await Promise.resolve();

            expect(ce.getAttribute('foo')).toBe('sake');
            expect(ce.foo).toBe('miso-prop');

            elm.data = 'mirin';
            await Promise.resolve();

            expect(ce.getAttribute('foo')).toBe('sake');
            expect(ce.foo).toBe('mirin-prop');
        });
    });
});
