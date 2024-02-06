import { createElement, setFeatureFlagForTest } from 'lwc';

import Reactive from 'x/reactive';
import NonReactive from 'x/nonReactive';
import ExplicitSubscribe from 'x/explicitSubscribe';
import List from 'x/list';

// Note for testing purposes the signal implementation uses LWC module resolution to simplify things.
// In production the signal will come from a 3rd party library.
import { Signal } from 'x/signal';

const createElementSignalAndInsertIntoDom = async (tagName, ctor, signalInitialValue) => {
    const elm = createElement(tagName, { is: ctor });
    const signal = new Signal(signalInitialValue);
    elm.signal = signal;
    document.body.appendChild(elm);
    await Promise.resolve();

    return { elm, signal };
};

describe('signal reaction in lwc', () => {
    beforeAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);
    });

    afterAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);
    });

    it('should render signal value', async () => {
        const { elm } = await createElementSignalAndInsertIntoDom(
            'x-reactive',
            Reactive,
            'initial value'
        );

        expect(elm.shadowRoot.textContent).toBe('initial value');
    });

    it('should re-render when signal notification is sent', async () => {
        const { elm, signal } = await createElementSignalAndInsertIntoDom(
            'x-reactive',
            Reactive,
            'initial value'
        );

        expect(elm.shadowRoot.textContent).toBe('initial value');

        // notification happens when value is updated
        signal.value = 'updated value';
        await Promise.resolve();

        expect(elm.shadowRoot.textContent).toEqual('updated value');
    });

    it('does not re-render when signal is not bound to an LWC', async () => {
        const elm = createElement('x-non-reactive', { is: NonReactive });
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(elm.shadowRoot.textContent).toBe('external signal value');

        elm.updateExternalSignal();
        await Promise.resolve();

        expect(elm.shadowRoot.textContent).toBe('external signal value');
    });

    it('should be able to re-render when manually subscribing to signal', async () => {
        const { elm, signal } = await createElementSignalAndInsertIntoDom(
            'x-manual-subscribe',
            ExplicitSubscribe,
            'initial value'
        );
        expect(elm.shadowRoot.textContent).toEqual('default');

        signal.value = 'new value';
        await Promise.resolve();

        expect(elm.shadowRoot.textContent).toEqual('new value');
    });

    it('render lists properly', async () => {
        const { elm, signal } = await createElementSignalAndInsertIntoDom(
            'x-reactive-list',
            List,
            [1, 2, 3]
        );

        expect(elm.shadowRoot.children.length).toBe(3);
        expect(elm.shadowRoot.children[0].textContent).toBe('1');
        expect(elm.shadowRoot.children[1].textContent).toBe('2');
        expect(elm.shadowRoot.children[2].textContent).toBe('3');

        signal.value = [3, 2, 1];

        await Promise.resolve();

        expect(elm.shadowRoot.children.length).toBe(3);
        expect(elm.shadowRoot.children[0].textContent).toBe('3');
        expect(elm.shadowRoot.children[1].textContent).toBe('2');
        expect(elm.shadowRoot.children[2].textContent).toBe('1');
    });
});
