import { createElement } from 'lwc';

import AdapterConsumer from 'x/adapterConsumer';
import { EchoWireAdapter } from 'x/echoAdapter';

import BroadcastConsumer from 'x/broadcastConsumer';
import { BroadcastAdapter } from 'x/broadcastAdapter';

const ComponentClass = AdapterConsumer;
const AdapterId = EchoWireAdapter;

function filterCalls(echoAdapterSpy, methodType) {
    return echoAdapterSpy.filter(call => call.method === methodType);
}

describe('wiring', () => {
    describe('component lifecycle and wire adapter', () => {
        it('should call a connect when component is connected', () => {
            const spy = [];
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            AdapterId.setSpy(spy);
            document.body.appendChild(elm);

            expect(filterCalls(spy, 'connect').length).toBe(1);
        });

        it('should call a disconnect when component is disconnected', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });

            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(filterCalls(spy, 'disconnect').length).toBe(1);
        });

        it('should call a connect and disconnect when component is connected, disconnected twice', () => {
            const spy = [];
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            AdapterId.setSpy(spy);

            document.body.appendChild(elm);
            document.body.removeChild(elm);
            document.body.appendChild(elm);
            document.body.removeChild(elm);

            const connectCalls = filterCalls(spy, 'connect');
            const disconnectCalls = filterCalls(spy, 'disconnect');

            expect(connectCalls.length).toBe(2);
            expect(disconnectCalls.length).toBe(2);
        });
    });

    describe('update method on wire adapter', () => {
        it('should be called when component is created', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            expect(spy.length).toBe(0);

            createElement('x-echo-adapter-consumer', { is: ComponentClass });

            expect(spy.length).toBe(1);
            expect(spy[0].method).toBe('update');
        });

        it('should be called only once during multiple renders when the wire config does not change', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            expect(filterCalls(spy, 'update').length).toBe(1); // update,connected
            elm.forceRerender();

            return Promise.resolve()
                .then(() => {
                    expect(filterCalls(spy, 'update').length).toBe(1);
                    elm.forceRerender();

                    return Promise.resolve();
                })
                .then(() => {
                    expect(filterCalls(spy, 'update').length).toBe(1);
                });
        });

        it('should be called when the wire parameters change its value.', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            expect(filterCalls(spy, 'update').length).toBe(1);
            elm.setDynamicParamSource('simpleParam modified');

            return Promise.resolve().then(() => {
                expect(filterCalls(spy, 'update').length).toBe(2);
                const wireResult = elm.getWiredProp();

                expect(wireResult.simpleParam).toBe('simpleParam modified');
            });
        });

        it('should be called for common parameter when shared among wires', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-bc-consumer', { is: BroadcastConsumer });
            document.body.appendChild(elm);

            expect(filterCalls(spy, 'update').length).toBe(2);
            elm.setCommonParameter('modified');

            return Promise.resolve().then(() => {
                expect(filterCalls(spy, 'update').length).toBe(4);
                const wireResult1 = elm.getEchoWiredProp1();
                const wireResult2 = elm.getEchoWiredProp2();

                expect(wireResult1.id).toBe('echoWire1');
                expect(wireResult1.common).toBe('modified');
                expect(wireResult2.id).toBe('echoWire2');
                expect(wireResult2.common).toBe('modified');
            });
        });

        it('should not update when setting parameter with same value', () => {
            const spy = [];
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            AdapterId.setSpy(spy);
            const expected = 'expected value';
            elm.setDynamicParamSource(expected);

            return Promise.resolve()
                .then(() => {
                    expect(spy.length).toBe(1); // update,connected
                    const wireResult = elm.getWiredProp();
                    expect(wireResult.simpleParam).toBe(expected);

                    elm.setDynamicParamSource(expected);

                    return Promise.resolve();
                })
                .then(() => {
                    expect(spy.length).toBe(1); // update,connected
                });
        });

        it('should trigger component rerender when field is updated', () => {
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            return Promise.resolve()
                .then(() => {
                    const staticValue = elm.shadowRoot.querySelector('.static');
                    const dynamicValue = elm.shadowRoot.querySelector('.dynamic');

                    expect(staticValue.textContent).toBe('1,2,3');
                    expect(dynamicValue.textContent).toBe('');

                    elm.setDynamicParamSource('modified value');

                    return Promise.resolve();
                })
                .then(() => {
                    const staticValue = elm.shadowRoot.querySelector('.static');
                    const dynamicValue = elm.shadowRoot.querySelector('.dynamic');

                    expect(staticValue.textContent).toBe('1,2,3');
                    expect(dynamicValue.textContent).toBe('modified value');
                });
        });
    });
});

describe('wired fields', () => {
    it('should rerender component when adapter pushes data', () => {
        BroadcastAdapter.clearInstances();
        const elm = createElement('x-bc-consumer', { is: BroadcastConsumer });
        document.body.appendChild(elm);
        BroadcastAdapter.broadcastData('expected value');

        return Promise.resolve()
            .then(() => {
                const staticValue = elm.shadowRoot.querySelector('span');
                expect(staticValue.textContent).toBe('expected value');
                BroadcastAdapter.broadcastData('modified value');

                return Promise.resolve();
            })
            .then(() => {
                const staticValue = elm.shadowRoot.querySelector('span');
                expect(staticValue.textContent).toBe('modified value');
            });
    });

    // failing: before it was track, now we only observe changes to the prop (not like with @track)
    it('should rerender component when value is mutated from within the component (prop.y = 5)', () => {
        BroadcastAdapter.clearInstances();
        const elm = createElement('x-bc-consumer', { is: BroadcastConsumer });
        document.body.appendChild(elm);
        BroadcastAdapter.broadcastData({ data: 'expected value' });

        return Promise.resolve()
            .then(() => {
                const staticValue = elm.shadowRoot.querySelector('span');
                expect(staticValue.textContent).toBe('expected value');

                elm.setWiredPropData('modified value');

                return Promise.resolve();
            })
            .then(() => {
                const staticValue = elm.shadowRoot.querySelector('span');
                expect(staticValue.textContent).toBe('modified value');
            });
    });
});

describe('wired methods', () => {
    it('should call component method when wired to a method', () => {
        BroadcastAdapter.clearInstances();
        const elm = createElement('x-bc-consumer', { is: BroadcastConsumer });
        document.body.appendChild(elm);
        BroadcastAdapter.broadcastData('expected value');

        return Promise.resolve().then(() => {
            const actual = elm.getWiredMethodArgument();
            expect(actual).toBe('expected value');
        });
    });
});
