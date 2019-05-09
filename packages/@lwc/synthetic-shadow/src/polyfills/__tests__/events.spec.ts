/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '@lwc/engine';
import {
    removeEventListener as nativeRemoveEventListener,
    addEventListener as nativeAddEventListener,
} from '../../env/element';

class MyComponent extends LightningElement {}

(() => {
    // Create an element to setup the polyfills, but discard since tests will make their own
    createElement('x-foo', { is: MyComponent });
})();

describe('events', () => {
    let div: HTMLDivElement;
    beforeEach(() => {
        div = document.createElement('div');
        document.body.appendChild(div);
    });
    afterEach(() => {
        document.body.removeChild(div);
    });

    describe('sanity', () => {
        it('polyfill is defined', () => {
            expect(nativeAddEventListener).toBeTruthy();
            expect(nativeRemoveEventListener).toBeTruthy();
        });
        it('native createElement uses polyfill', () => {
            // Expect addEventListener to be different than native
            expect(div.addEventListener).toBeTruthy();
            expect(nativeAddEventListener).not.toBe(div.addEventListener);
        });
        it('createElement uses polyfill', () => {
            const foo = createElement('x-foo', { is: MyComponent });

            // Expect addEventListener to be different than native
            expect(foo.addEventListener).toBeTruthy();
            expect(nativeAddEventListener).not.toBe(foo.addEventListener);
        });
    });

    describe('legacy handleEvent', () => {
        it('supports subscribe with handleEvent object', () => {
            const handler = { handleEvent: jest.fn() };
            div.addEventListener('foo', handler);

            div.dispatchEvent(new CustomEvent('foo'));

            expect(handler.handleEvent).toBeCalled();
        });
        it('supports unsubscribe with handleEvent object', () => {
            const handler = { handleEvent: jest.fn() };
            div.addEventListener('foo', handler);
            div.removeEventListener('foo', handler);

            div.dispatchEvent(new CustomEvent('foo'));

            expect(handler.handleEvent).not.toBeCalled();
        });
        it('supports unsubscribe when handleEvent changes', () => {
            const handler = { handleEvent: jest.fn() };
            div.addEventListener('foo', handler);

            handler.handleEvent = jest.fn();
            div.removeEventListener('foo', handler);

            div.dispatchEvent(new CustomEvent('foo'));

            expect(handler.handleEvent).not.toBeCalled();
        });
    });

    // tests that work for window or Node. Need to test each because the
    // polyfill has two cloned implementations.
    // Using arrow function for late binding on 'div'
    describe.each([() => div, () => window])('%p patch', elm => {
        it('addEventListener does not throw for wrong arguments', () => {
            elm().addEventListener(undefined as string, undefined as EventListener);
            elm().addEventListener(null as string, undefined as EventListener);
            elm().addEventListener('foo', undefined as EventListener);
            elm().addEventListener('foo', null);
        });
        it('removeEventListener does not throw for wrong arguments', () => {
            elm().removeEventListener(undefined as string, undefined as EventListener);
            elm().removeEventListener(null as string, undefined as EventListener);
            elm().removeEventListener('foo', undefined as EventListener);
            elm().removeEventListener('foo', null);
        });
        it('supports native subscribe', () => {
            const handler = jest.fn();
            nativeAddEventListener.call(elm(), 'foo', handler);

            elm().dispatchEvent(new CustomEvent('foo'));

            // Subscribing through native code is fine. This could happen before the framework loads, for example.
            expect(handler).toBeCalled();
        });
        it('does not support native unsubscribe', () => {
            const handler = jest.fn();
            elm().addEventListener('foo', handler);
            nativeRemoveEventListener.call(elm(), 'foo', handler);

            elm().dispatchEvent(new CustomEvent('foo'));

            // Unsubscribing a "wrapped" listener through native code should not work, so we'll still receive the event here.
            expect(handler).toBeCalled();
        });
        it('supports native subscribe and wrapped unsubscribe', () => {
            const handler = jest.fn();

            // Handler was subscribed through native method (perhaps before framework is loaded)
            nativeAddEventListener.call(elm(), 'foo', handler);

            // But unsubscribed through our wrapped method (after framework is loaded)
            elm().removeEventListener('foo', handler);

            elm().dispatchEvent(new CustomEvent('foo'));

            // Unsubscription should be successful and event should not be received
            expect(handler).not.toBeCalled();
        });
    });
});
