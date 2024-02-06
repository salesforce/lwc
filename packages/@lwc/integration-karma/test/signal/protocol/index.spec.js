import { createElement, setFeatureFlagForTest } from 'lwc';
import Reactive from 'x/reactive';
import NonReactive from 'x/nonReactive';
import Container from 'x/container';
import Parent from 'x/parent';
import Child from 'x/child';
import DuplicateSignalOnTemplate from 'x/duplicateSignalOnTemplate';
import List from 'x/list';

// Note for testing purposes the signal implementation uses LWC module resolution to simplify things.
// In production the signal will come from a 3rd party library.
import { Signal } from 'x/signal';

describe('signal protocol', () => {
    beforeAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true);
    });

    afterAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);
    });

    describe('lwc engine subscribes template re-render callback when signal is bound to an LWC and used on a template', () => {
        [
            {
                testName: 'contains a getter that references a bound signal (.value on template)',
                flag: 'showGetterSignal',
            },
            {
                testName: 'contains a getter that references a bound signal value',
                flag: 'showOnlyUsingSignalNotValue',
            },
            {
                testName: 'contains a signal with @api annotation (.value on template)',
                flag: 'showApiSignal',
            },
            {
                testName: 'contains a signal with @track annotation (.value on template)',
                flag: 'showTrackedSignal',
            },
            {
                testName: 'contains an observed field referencing a signal (.value on template)',
                flag: 'showObservedFieldSignal',
            },
            {
                testName: 'contains a direct reference to a signal (not .value) in the template',
                flag: 'showOnlyUsingSignalNotValue',
            },
        ].forEach(({ testName, flag }) => {
            // Test all ways of binding signal to an LWC + template that cause re-rendering
            it(testName, async () => {
                const elm = createElement('x-reactive', { is: Reactive });
                document.body.appendChild(elm);
                await Promise.resolve();

                expect(elm.getSignalSubscriberCount()).toBe(0);
                elm[flag] = true;
                await Promise.resolve();

                // the engine will automatically subscribe the re-render callback
                expect(elm.getSignalSubscriberCount()).toBe(1);
            });
        });
    });

    it('lwc engine should automatically unsubscribe the re-render callback if signal is not used on a template', async () => {
        const elm = createElement('x-reactive', { is: Reactive });
        elm.showObservedFieldSignal = true;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(elm.getSignalSubscriberCount()).toBe(1);
        elm.showObservedFieldSignal = false;
        await Promise.resolve();

        expect(elm.getSignalSubscriberCount()).toBe(0);
        document.body.removeChild(elm);
    });

    it('lwc engine does not subscribe re-render callback if signal is not used on a template', async () => {
        const elm = createElement('x-non-reactive', { is: NonReactive });
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(elm.getSignalSubscriberCount()).toBe(0);
    });

    it('only the components referencing a signal should re-render', async () => {
        const container = createElement('x-container', { is: Container });
        // append the container first to avoid error message with native lifecycle
        document.body.appendChild(container);
        await Promise.resolve();

        const signalElm = createElement('x-signal-elm', { is: Child });
        const signal = new Signal('initial value');
        signalElm.signal = signal;
        container.appendChild(signalElm);
        await Promise.resolve();

        expect(container.renderCount).toBe(1);
        expect(signalElm.renderCount).toBe(1);
        expect(signal.getSubscriberCount()).toBe(1);

        signal.value = 'updated value';
        await Promise.resolve();

        expect(container.renderCount).toBe(1);
        expect(signalElm.renderCount).toBe(2);
        expect(signal.getSubscriberCount()).toBe(1);
    });

    it('only subscribes the re-render callback a single time when signal is referenced multiple times on a template', async () => {
        const elm = createElement('x-duplicate-signals-on-template', {
            is: DuplicateSignalOnTemplate,
        });
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(elm.renderCount).toBe(1);
        expect(elm.getSignalSubscriberCount()).toBe(1);
        expect(elm.getSignalRemovedSubscriberCount()).toBe(0);

        elm.updateSignalValue();
        await Promise.resolve();

        expect(elm.renderCount).toBe(2);
        expect(elm.getSignalSubscriberCount()).toBe(1);
        expect(elm.getSignalRemovedSubscriberCount()).toBe(1);
    });

    it('only subscribes re-render callback a single time when signal is referenced multiple times in a list', async () => {
        const elm = createElement('x-list', { is: List });
        const signal = new Signal('initial value');
        elm.signal = signal;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(1);
        expect(signal.getRemovedSubscriberCount()).toBe(0);

        document.body.removeChild(elm);
        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(0);
        expect(signal.getRemovedSubscriberCount()).toBe(1);
    });

    it('unsubscribes when element is removed from the dom', async () => {
        const elm = createElement('x-child', { is: Child });
        const signal = new Signal('initial value');
        elm.signal = signal;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(1);
        expect(signal.getRemovedSubscriberCount()).toBe(0);

        document.body.removeChild(elm);
        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(0);
        expect(signal.getRemovedSubscriberCount()).toBe(1);
    });

    it('on template re-render unsubscribes all components where signal is not present on the template', async () => {
        const elm = createElement('x-parent', { is: Parent });
        elm.showChild = true;

        document.body.appendChild(elm);
        await Promise.resolve();

        // subscribed both parent and child
        // as long as parent contains reference to the signal, even if it's just to pass it to a child
        // it will be subscribed.
        expect(elm.getSignalSubscriberCount()).toBe(2);
        expect(elm.getSignalRemovedSubscriberCount()).toBe(0);

        elm.showChild = false;
        await Promise.resolve();

        // The signal is not being used on the parent template anymore so it will be removed
        expect(elm.getSignalSubscriberCount()).toBe(0);
        expect(elm.getSignalRemovedSubscriberCount()).toBe(2);
    });

    it('does not subscribe if the signal shape is incorrect', async () => {
        const elm = createElement('x-child', { is: Child });
        const subscribe = jasmine.createSpy();
        // Note the signals property is value's' and not value
        const signal = { values: 'initial value', subscribe };
        elm.signal = signal;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(subscribe).not.toHaveBeenCalled();
    });
});

describe('ENABLE_EXPERIMENTAL_SIGNALS not set', () => {
    beforeAll(() => {
        setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false);
    });

    it('does not subscribe or unsubscribe if feature flag is disabled', async () => {
        const elm = createElement('x-child', { is: Child });
        const signal = new Signal('initial value');
        elm.signal = signal;
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(0);
        expect(signal.getRemovedSubscriberCount()).toBe(0);

        document.body.removeChild(elm);
        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(0);
        expect(signal.getRemovedSubscriberCount()).toBe(0);
    });
});
