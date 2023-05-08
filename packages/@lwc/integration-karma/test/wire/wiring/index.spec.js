import { createElement, setFeatureFlagForTest } from 'lwc';

import AdapterConsumer from 'x/adapterConsumer';
import { EchoWireAdapter } from 'x/echoAdapter';

import BroadcastConsumer from 'x/broadcastConsumer';
import { BroadcastAdapter } from 'x/broadcastAdapter';

import InheritedMethods from 'x/inheritedMethods';

import ContextAwareConsumer from 'x/contextAwareConsumer';
import { ContextAwareWireAdapter } from 'x/contextAwareAdapter';

const ComponentClass = AdapterConsumer;
const AdapterId = EchoWireAdapter;
const ContextLog = ContextAwareWireAdapter;

function filterCalls(echoAdapterSpy, methodType) {
    return echoAdapterSpy.filter((call) => call.method === methodType);
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
        it('should be called in same tick when component with wire no dynamic params is created', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            expect(spy.length).toBe(0);

            const elm = createElement('x-echo-adapter-consumer', { is: InheritedMethods });
            document.body.appendChild(elm);

            const updateCalls = filterCalls(spy, 'update');
            expect(updateCalls).toHaveSize(3);
            expect(updateCalls[0].method).toBe('update'); // parentMethod
            expect(updateCalls[1].method).toBe('update'); // childMethod
            expect(updateCalls[2].method).toBe('update'); // overriddenInChild
        });

        describe('with ENABLE_WIRE_SYNC_EMIT=true', () => {
            beforeEach(() => {
                setFeatureFlagForTest('ENABLE_WIRE_SYNC_EMIT', true);
            });

            afterEach(() => {
                setFeatureFlagForTest('ENABLE_WIRE_SYNC_EMIT', false);
            });

            it('should be called synchronously after connect when a component with wire that has dynamic params is created', () => {
                const spy = [];
                AdapterId.setSpy(spy);
                expect(spy.length).toBe(0);

                const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
                document.body.appendChild(elm);

                expect(spy).toHaveSize(2);
                expect(spy[0].method).toBe('connect');
                expect(spy[1].method).toBe('update');
            });

            it('should call synchronously update only once when the component is created and a wire dynamic param is modified', () => {
                const spy = [];
                AdapterId.setSpy(spy);
                expect(spy.length).toBe(0);

                const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
                elm.setDynamicParamSource(1);
                document.body.appendChild(elm);

                // in the old wire protocol, there is only one call because
                // on the same tick the config was modified
                const updateCalls = filterCalls(spy, 'update');
                expect(updateCalls).toHaveSize(1);
            });
        });

        it('should be called next tick when the component with wire that has dynamic params is created', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            expect(spy.length).toBe(0);

            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            expect(spy).toHaveSize(1);
            expect(spy[0].method).toBe('connect');

            return Promise.resolve().then(() => {
                expect(spy).toHaveSize(2);
                expect(spy[0].method).toBe('connect');
                expect(spy[1].method).toBe('update');
            });
        });

        it('should call update only once when the component is created and a wire dynamic param is modified in the same tick', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            expect(spy.length).toBe(0);

            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            elm.setDynamicParamSource(1);
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                // in the old wire protocol, there is only one call because
                // on the same tick the config was modified
                const updateCalls = filterCalls(spy, 'update');
                expect(updateCalls).toHaveSize(1);
            });
        });

        it('should be called only once during multiple renders when the wire config does not change', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            return Promise.resolve()
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                    elm.forceRerender();

                    return Promise.resolve();
                })
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                });
        });

        it('should be called when the wire parameters change its value.', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            return Promise.resolve()
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                    elm.setDynamicParamSource('simpleParam modified');

                    return Promise.resolve();
                })
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(2);
                    const wireResult = elm.getWiredProp();

                    expect(wireResult.simpleParam).toBe('simpleParam modified');
                });
        });

        it('should be called for common parameter when shared among wires', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-bc-consumer', { is: BroadcastConsumer });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(filterCalls(spy, 'update')).toHaveSize(2);
                elm.setCommonParameter('modified');

                return Promise.resolve().then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(4);
                    const wireResult1 = elm.getEchoWiredProp1();
                    const wireResult2 = elm.getEchoWiredProp2();

                    expect(wireResult1.id).toBe('echoWire1');
                    expect(wireResult1.common).toBe('modified');
                    expect(wireResult2.id).toBe('echoWire2');
                    expect(wireResult2.common).toBe('modified');
                });
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

        it('should trigger component rerender when field is updated', (done) => {
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            Promise.resolve()
                .then(() => Promise.resolve()) // In this tick, the config is injected.
                .then(() => {
                    // Now the component have re-rendered.
                    const staticValue = elm.shadowRoot.querySelector('.static');
                    const dynamicValue = elm.shadowRoot.querySelector('.dynamic');

                    expect(staticValue.textContent).toBe('1,2,3');
                    expect(dynamicValue.textContent).toBe('');

                    elm.setDynamicParamSource('modified value');

                    setTimeout(() => {
                        const staticValue = elm.shadowRoot.querySelector('.static');
                        const dynamicValue = elm.shadowRoot.querySelector('.dynamic');

                        expect(staticValue.textContent).toBe('1,2,3');
                        expect(dynamicValue.textContent).toBe('modified value');

                        done();
                    }, 5);
                });
        });

        it('should not call update when component is disconnected.', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            return Promise.resolve()
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                    document.body.removeChild(elm);
                    elm.setDynamicParamSource('simpleParam modified');
                })
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                });
        });

        it('should call update when component is re-connected.', () => {
            const spy = [];
            AdapterId.setSpy(spy);
            const elm = createElement('x-echo-adapter-consumer', { is: ComponentClass });
            document.body.appendChild(elm);

            return Promise.resolve()
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                    document.body.removeChild(elm);
                    elm.setDynamicParamSource('simpleParam modified');
                })
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(1);
                    const wireResult = elm.getWiredProp();

                    expect(wireResult.simpleParam).not.toBeDefined();
                    document.body.appendChild(elm);
                })
                .then(() => {
                    expect(filterCalls(spy, 'update')).toHaveSize(2);
                    const wireResult = elm.getWiredProp();

                    expect(wireResult.simpleParam).toBe('simpleParam modified');
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

    it('should rerender component when wired field is mutated from within the component', () => {
        BroadcastAdapter.clearInstances();
        const elm = createElement('x-bc-consumer', { is: BroadcastConsumer });
        document.body.appendChild(elm);
        BroadcastAdapter.broadcastData('expected value');

        return Promise.resolve()
            .then(() => {
                const staticValue = elm.shadowRoot.querySelector('span');
                expect(staticValue.textContent).toBe('expected value');

                elm.setWiredPropToValue('modified value');
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

    it('should support method override', () => {
        const spy = [];
        EchoWireAdapter.setSpy(spy);
        const elm = createElement('x-inherited-methods', { is: InheritedMethods });
        document.body.appendChild(elm);

        // No need to wait for next tick, the wire only has static config.
        const calls = filterCalls(spy, 'update');
        const getCallByName = (name) => {
            return calls.filter((call) => name === call.args[0].name)[0];
        };

        expect(calls.length).toBe(3);

        expect(getCallByName('overriddenInChild').args[0].child).toBe(true);
        expect(getCallByName('childMethod').args[0].child).toBe(true);
        expect(getCallByName('parentMethod').args[0].parent).toBe(true);
    });
});

describe('context aware', () => {
    it('should receive the source element tag name when adapter is constructed', () => {
        const spy = [];
        ContextLog.setSpy(spy);

        const hostTagNameA = 'x-context-aware-a';
        const hostTagNameB = 'x-context-aware-b';

        createElement(hostTagNameA, { is: ContextAwareConsumer });
        createElement(hostTagNameB, { is: ContextAwareConsumer });

        expect(spy[0].hostContext.tagName).toBe(hostTagNameA);
        expect(spy[1].hostContext.tagName).toBe(hostTagNameB);
    });
});
