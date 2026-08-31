import { createElement, setFeatureFlagForTest } from 'lwc';
import LeakyContextConsumer from 'x/leakyContextConsumer';
import { initContext } from '../../../helpers/context.js';
import { resetDOM } from '../../../helpers/reset.js';

const CONTEXT_REQUEST_EVENT = 'lightning:context-request';

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

        // Track the provider listener via add/removeEventListener on the host.
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
});
