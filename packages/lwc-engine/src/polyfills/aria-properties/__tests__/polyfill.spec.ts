import '../main';

import { ElementPrototypeAriaPropertyNames } from '../main';
import { patch } from '../polyfill';

// TODO: https://github.com/salesforce/lwc/pull/568#discussion_r208827386
// While Jest creates a new window object between each test file evaluation, the
// jsdom code is not reevaluated. Which mean that the patched
// HTMLElement.prototype.click will remain patched for all the tests that happen
// to run in the same worker. This is a growing pain that we have today because
// it introduces an uncertainty in the way tests run. We really need to speak
// about to mitigate this issue in the future.
for (let i = 0, len = ElementPrototypeAriaPropertyNames.length; i < len; i += 1) {
    const propName = ElementPrototypeAriaPropertyNames[i];
    // forcing to always patch for tests
    patch(propName);
}

describe('aria-properties polyfill', () => {
    describe('#role', () => {
        it('should reflect attribute by default', () => {
            const element = document.createElement('x-foo');
            element.role = 'tab';
            expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
        });

        it('should return correct value from getter', () => {
            const element = document.createElement('x-foo');
            element.role = 'tab';
            expect(element.role).toBe('tab');
        });

        it('should return correct reflective value from getter', () => {
            const element = document.createElement('x-foo');
            element.setAttribute('role', 'tab');
            expect(element.role).toBe('tab');
        });

        it('should return correct value when nothing has been set', () => {
            const element = document.createElement('x-foo');
            expect(element.role).toBe(null);
        });

        it('should remove role attribute from element when value is null', () => {
            const element = document.createElement('x-foo');
            element.role = 'tab';
            expect(HTMLElement.prototype.hasAttribute.call(element, 'role')).toBe(true);
            element.role = null;
            expect(HTMLElement.prototype.hasAttribute.call(element, 'role')).toBe(false);
        });

        it('should reflect default value when reflective attribute has been removed', () => {
            const element = document.createElement('x-foo');
            element.role = 'tab';
            element.setAttribute('role', 'button');
            expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'role')).toBe('button');
            expect(element.role).toBe('tab');
            element.removeAttribute('role');
            expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
        });
    });

    describe('#ariaChecked', () => {
        it('should reflect attribute by default', () => {
            const element = document.createElement('x-foo');
            element.ariaChecked = 'true';
            expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
        });

        it('should return correct value from getter', () => {
            const element = document.createElement('x-foo');
            element.ariaChecked = 'true';
            expect(element.ariaChecked).toBe('true');
        });

        it('should return correct reflective value from getter', () => {
            const element = document.createElement('x-foo');
            element.setAttribute('aria-checked', 'true');
            expect(element.ariaChecked).toBe('true');
        });

        it('should return correct value when nothing has been set', () => {
            const element = document.createElement('x-foo');
            expect(element.ariaChecked).toBe(null);
        });

        it('should remove attribute from element when value is null', () => {
            const element = document.createElement('x-foo');
            element.ariaChecked = 'true';
            expect(HTMLElement.prototype.hasAttribute.call(element, 'aria-checked')).toBe(true);
            element.ariaChecked = null;
            expect(HTMLElement.prototype.hasAttribute.call(element, 'aria-checked')).toBe(false);
        });

        it('should reflect default value when reflective attribute has been removed', () => {
            const element = document.createElement('x-foo');
            element.ariaChecked = 'true';
            element.setAttribute('aria-checked', 'button');
            expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('button');
            expect(element.ariaChecked).toBe('true');
            element.removeAttribute('aria-checked');
            expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
        });
    });
});
