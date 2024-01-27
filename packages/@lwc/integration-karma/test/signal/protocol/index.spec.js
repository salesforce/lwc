import { createElement } from 'lwc';
import Reactive from 'x/reactive';
import NonReactive from 'x/nonReactive';
import Parent from 'x/parent';
import Child from 'x/child';
import { Signal } from 'x/signal';

describe('signal protocol', () => {
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

    it('lwc engine does not subscribe the re-render callback if signal is not used on a template', async () => {
        const elm = createElement('x-non-reactive', { is: NonReactive });
        document.body.appendChild(elm);
        await Promise.resolve();

        expect(elm.getSignalSubscriberCount()).toBe(0);
    });

    it('only the components referencing a signal should re-render', async () => {
        const container = createElement('x-container', { is: Parent });
        const signalElm = createElement('x-signal-elm', { is: Child });
        const signal = new Signal('initial value');
        signalElm.signal = signal;
        container.appendChild(signalElm);
        document.body.appendChild(container);

        await Promise.resolve();

        expect(container.renderCount).toBe(1);
        expect(signalElm.renderCount).toBe(1);

        signal.value = 'updated value';

        await Promise.resolve();

        expect(signal.getSubscriberCount()).toBe(1);
        expect(container.renderCount).toBe(1);
        expect(signalElm.renderCount).toBe(2);
    });
});
