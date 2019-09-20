import { createElement } from 'lwc';

import EchoAdapterConsumer from 'x/echoAdapterConsumer';
import { EchoWireAdapter } from 'x/echoAdapter';

describe('wire adapter update', () => {
    it('should invoke listener with reactive parameter default value', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.recordId).toBe('default value');
        });
    });

    xit('should invoke listener with reactive parameter is an expando and change', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setExpandoValue('expando modified value');
        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.expando).toBe('expando modified value');
        });
    });

    it('should not invoke update when parameter value is unchanged', () => {
        const spy = [];
        EchoWireAdapter.setSpy(spy);
        const wireKey = { b: { c: { d: 'a.b.c.d value' } } };
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });

        document.body.appendChild(elm);
        elm.setWireKeyParameter(wireKey);

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(spy.length).toBe(2);
            expect(actualWiredValues.data.recordId).toBe('default value');
            elm.setWireKeyParameter(wireKey);

            return Promise.resolve().then(() => {
                expect(spy.length).toBe(2);
            });
        });
    });

    it('should invoke listener with getter value', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.getterValue).toBe('getterValue');
        });
    });

    it('should react invoke listener with getter value when dependant value is updated', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setMutatedGetterValue(' mutated');

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.getterValue).toBe('getterValue mutated');
        });
    });

    // all currently failing
    describe('reactivity when vm.isDirty === true', () => {
        it('should call update with value set before connected (using observed fields)', () => {
            const wireKey = { b: { c: { d: 'expected' } } };
            const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
            elm.setWireKeyParameter(wireKey);

            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const actualWiredValues = elm.getWiredProp();
                expect(actualWiredValues.data.keyVal).toBe('expected');
            });
        });

        it('should call update when value set in setter (using @track) that makes dirty the vm', () => {
            const wireKey = { b: { c: { d: 'a.b.c.d value' } } };
            const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });

            document.body.appendChild(elm);
            elm.setTrackedPropAndWireKeyParameter(wireKey);

            return Promise.resolve().then(() => {
                const actualWiredValues = elm.getWiredProp();
                expect(actualWiredValues.data.keyVal).toBe('a.b.c.d value');
            });
        });

        it('should call update when value set in setter (using @api) that makes dirty the vm', () => {
            const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
            // done before connected, so we ensure the component is dirty.
            elm.recordId = 'modified Value';

            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const actualWiredValues = elm.getWiredProp();
                expect(actualWiredValues.data.recordId).toBe('modified Value');
            });
        });
    });
});

describe('reactive parameter', () => {
    it('should return value when multiple levels deep', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter({ b: { c: { d: 'a.b.c.d value' } } });

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe('a.b.c.d value');
        });
    });

    it('should return object value', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        const expected = { e: { f: 'expected' } };
        elm.setWireKeyParameter({ b: { c: { d: expected } } });

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe(expected);
        });
    });

    it('should return undefined when root is undefined', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter(undefined);

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe(undefined);
        });
    });

    it('should return undefined when part of the value is not defined', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter({ b: undefined });

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe(undefined);
        });
    });

    it('should return undefined when a segment is not found', () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter({ b: { fooNotC: 'a.b.c.d value' } });

        return Promise.resolve().then(() => {
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe(undefined);
        });
    });
});
