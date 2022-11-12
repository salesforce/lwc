import { createElement } from 'lwc';
import { isNativeShadowRootInstance } from 'test-utils';

import Test from 'x/test';

describe('lwc:external', () => {
    let test;

    beforeEach(() => {
        test = createElement('x-test', { is: Test });
        document.body.appendChild(test);
    });

    describe('when not upgraded', () => {
        it('should set only attributes on mount', () => {
            return Promise.resolve().then(() => {
                const elm = test.shadowRoot.querySelector('foo-upgrade-never');
                expect(elm.getAttribute('foo')).toBe('default');
                expect(elm.data).toBeUndefined();
            });
        });

        it('should set only attributes on update', () => {
            test.value = 'apple';
            return Promise.resolve().then(() => {
                const elm = test.shadowRoot.querySelector('foo-upgrade-never');
                expect(elm.getAttribute('foo')).toBe('apple');
                expect(elm.data).toBeUndefined();
            });
        });
    });

    if (!process.env.COMPAT) {
        describe('after upgrading', () => {
            // This test was not broken up into smaller ones with individual assertions because we
            // cannot manage the order in which different tests run. Order is important because once you
            // define a custom element, there is no way to undefine it.
            it('should set property instead of attribute', async () => {
                const elm = test.shadowRoot.querySelector('foo-upgrade-after');

                test.value = 'sake';
                await Promise.resolve();

                expect(elm.shadowRoot).toBeNull();
                expect(elm.getAttribute('foo')).toBe('sake');
                expect(elm.data).toBeUndefined();

                test.upgrade();

                test.value = 'miso';
                await Promise.resolve();

                expect(elm.getAttribute('foo')).toBe('sake');
                expect(elm.data).toBe('miso-prop');

                test.value = 'mirin';
                await Promise.resolve();

                expect(elm.getAttribute('foo')).toBe('sake');
                expect(elm.data).toBe('mirin-prop');
            });
        });

        describe('standard web component apis', () => {
            it('should distribute slotted content', () => {
                const elm = test.shadowRoot.querySelector('foo-upgrade-before');
                const div = test.shadowRoot.querySelector('div.before');
                const slot = elm.shadowRoot.querySelector('slot');

                expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTruthy();
                expect(div.assignedSlot).toBe(slot);
                expect(slot.assignedElements().includes(div)).toBeTruthy();
            });
        });

        describe('passing objects as data', () => {
            it('should be stringified when set as an attribute', async () => {
                const elm = test.shadowRoot.querySelector('foo-set-object');

                test.value = {};

                return Promise.resolve().then(() => {
                    expect(elm.getAttribute('attr')).toBe('[object Object]');
                });
            });

            it('should pass object without stringifying', () => {
                const elm = test.shadowRoot.querySelector('foo-set-object');

                const obj = {};
                test.value = obj;

                return Promise.resolve().then(() => {
                    expect(elm.prop).toEqual(obj);
                });
            });
        });
    }
});
