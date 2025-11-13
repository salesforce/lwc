import { createElement } from 'lwc';

import EchoAdapterConsumer from 'x/echoAdapterConsumer';
import { EchoWireAdapter } from 'x/echoAdapter';

describe('wire adapter update', () => {
    it('should invoke listener with reactive parameter default value', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.recordId).toBe('default value');
    });

    xit('should invoke listener with reactive parameter is an expando and change', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setExpandoValue('expando modified value');
        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.expando).toBe('expando modified value');
    });

    it('should not invoke update when parameter value is unchanged', async () => {
        const spy = [];
        EchoWireAdapter.setSpy(spy);
        const wireKey = { b: { c: { d: 'a.b.c.d value' } } };
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });

        elm.setWireKeyParameter(wireKey);
        document.body.appendChild(elm);

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(spy).toHaveSize(1);
        expect(actualWiredValues.data.recordId).toBe('default value');
        elm.setWireKeyParameter(wireKey);
        await Promise.resolve();
        expect(spy).toHaveSize(1);
    });

    it('should invoke listener with getter value', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.getterValue).toBe('getterValue');
    });

    it('should react invoke listener with getter value when dependant value is updated', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setMutatedGetterValue(' mutated');

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.getterValue).toBe('getterValue mutated');
    });

    describe('reactivity when vm.isDirty === true', () => {
        it('should call update with value set before connected (using observed fields)', async () => {
            const wireKey = { b: { c: { d: 'expected' } } };
            const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
            elm.setWireKeyParameter(wireKey);

            document.body.appendChild(elm);

            await Promise.resolve();
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe('expected');
        });

        it('should call update when value set in setter (using @track) that makes dirty the vm', async () => {
            const wireKey = { b: { c: { d: 'a.b.c.d value' } } };
            const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });

            document.body.appendChild(elm);
            elm.setTrackedPropAndWireKeyParameter(wireKey);

            await Promise.resolve();
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.keyVal).toBe('a.b.c.d value');
        });

        it('should call update when value set in setter (using @api) that makes dirty the vm', async () => {
            const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
            // done before connected, so we ensure the component is dirty.
            elm.recordId = 'modified Value';

            document.body.appendChild(elm);

            await Promise.resolve();
            const actualWiredValues = elm.getWiredProp();
            expect(actualWiredValues.data.recordId).toBe('modified Value');
        });
    });
});

describe('reactive parameter', () => {
    it('should return value when multiple levels deep', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter({ b: { c: { d: 'a.b.c.d value' } } });

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.keyVal).toBe('a.b.c.d value');
    });

    it('should return object value', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        const expected = { e: { f: 'expected' } };
        elm.setWireKeyParameter({ b: { c: { d: expected } } });

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.keyVal).toBe(expected);
    });

    it('should return undefined when root is undefined', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter(undefined);

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.keyVal).toBe(undefined);
    });

    it('should return undefined when part of the value is not defined', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter({ b: undefined });

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.keyVal).toBe(undefined);
    });

    it('should return undefined when a segment is not found', async () => {
        const elm = createElement('x-echo-adapter-consumer', { is: EchoAdapterConsumer });
        document.body.appendChild(elm);

        elm.setWireKeyParameter({ b: { fooNotC: 'a.b.c.d value' } });

        await Promise.resolve();
        const actualWiredValues = elm.getWiredProp();
        expect(actualWiredValues.data.keyVal).toBe(undefined);
    });
});
