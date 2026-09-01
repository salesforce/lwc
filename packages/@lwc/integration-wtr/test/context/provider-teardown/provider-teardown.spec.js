import { createElement, setFeatureFlagForTest } from 'lwc';
import LeakyContextConsumer from 'x/leakyContextConsumer';
import MultiContextConsumer from 'x/multiContextConsumer';
import { initContext } from '../../../helpers/context.js';
import { resetDOM } from '../../../helpers/reset.js';

const CONTEXT_REQUEST_EVENT = 'lightning:context-request';

// Record provider-listener add/remove on the host by reference.
function trackContextListeners(elm) {
    const added = [];
    const removed = [];
    const originalAdd = elm.addEventListener.bind(elm);
    const originalRemove = elm.removeEventListener.bind(elm);
    elm.addEventListener = (type, listener, options) => {
        if (type === CONTEXT_REQUEST_EVENT) added.push(listener);
        return originalAdd(type, listener, options);
    };
    elm.removeEventListener = (type, listener, options) => {
        if (type === CONTEXT_REQUEST_EVENT) removed.push(listener);
        return originalRemove(type, listener, options);
    };
    return { added, removed };
}

// The provider-side `lightning:context-request` listener registered when a component consumes
// trusted context must be removed on disconnect, else its closure leaks the detached component.
describe('context provider listener teardown', () => {
    beforeAll(() => {
        initContext();
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);
    });

    afterAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);
    });

    afterEach(resetDOM);

    it('removes the provider-side context-request listener when a context consumer disconnects', async () => {
        const elm = createElement('x-leaky-context-consumer', { is: LeakyContextConsumer });
        const { added, removed } = trackContextListeners(elm);

        document.body.appendChild(elm);
        await Promise.resolve();

        // One trusted-context field → exactly one provider listener registered on connect.
        expect(added.length).toBe(1);

        document.body.removeChild(elm);
        await Promise.resolve();

        // Each added listener must be removed by the same reference, else the closure leaks the component.
        expect(removed.length).toBe(added.length);
        added.forEach((listener) => expect(removed).toContain(listener));
    });

    it('removes every provider listener when a consumer with multiple trusted-context fields disconnects', async () => {
        const elm = createElement('x-multi-context-consumer', { is: MultiContextConsumer });
        const { added, removed } = trackContextListeners(elm);

        document.body.appendChild(elm);
        await Promise.resolve();

        // Two trusted-context fields → two distinct provider listeners tracked for the same VM.
        expect(added.length).toBe(2);

        document.body.removeChild(elm);
        await Promise.resolve();

        // Every listener must be removed by reference; none may outlive the detached component.
        expect(removed.length).toBe(added.length);
        added.forEach((listener) => expect(removed).toContain(listener));
    });
});
