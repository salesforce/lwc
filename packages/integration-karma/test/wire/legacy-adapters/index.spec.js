import { createElement } from 'lwc';

import StaticWiredProps from 'x/staticWiredProps';
import DynamicWiredProps from 'x/dynamicWiredProps';

describe('legacy wire adapters (register call)', () => {
    describe('with static config', () => {
        it('should call config when config is empty (@wire(foo)...)', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            const calls = elm.emptyConfigCalls;
            expect(calls.length).toBe(1);
            expect(calls[0]).toEqual({});
        });

        it('should call config when config is empty object', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            const calls = elm.emptyObjectConfigCalls;
            expect(calls.length).toBe(1);
            expect(calls[0]).toEqual({});
        });

        // Note: In the legacy adapters with static config, this check was not enforced, they always get called.
        // With the wire reform, this case will be treated the same as when it has dynamic($) parameters.
        it('should not call config when all props of config config are undefined', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            const calls = elm.allUndefinedPropsInConfigCalls;
            expect(calls.length).toBe(0);
        });

        it('should call config when at least one prop in config is defined', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            const calls = elm.someUndefinedPropsInConfigCalls;
            expect(calls.length).toBe(1);
            expect(calls[0]).toEqual({ p1: 'test', p2: undefined });
        });
    });

    describe('with dynamic config', () => {
        it('should not call config when all initially all props of config are undefined', done => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });

            setTimeout(() => {
                const calls = elm.allUndefinedConfigCalls;
                expect(calls.length).toBe(0);
                done();
            }, 0);
        });

        it('should call config when at least one prop in config is defined', done => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });

            setTimeout(() => {
                const calls = elm.someDefinedConfigCalls;
                expect(calls.length).toBe(1);
                expect(calls[0]).toEqual({ p1: undefined, p3: 'test' });

                done();
            }, 0);
        });

        it('should call config when all props become undefined after initialization', done => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });

            setTimeout(() => {
                const calls = elm.someDefinedConfigCalls;
                expect(calls.length).toBe(1);
                expect(calls[0]).toEqual({ p1: undefined, p3: 'test' });

                elm.setParam('p3', undefined);

                setTimeout(() => {
                    const calls = elm.someDefinedConfigCalls;
                    expect(calls.length).toBe(2);
                    expect(calls[1]).toEqual({ p1: undefined, p3: undefined });
                    done();
                }, 0);
            }, 0);
        });

        it('should call config when initially all props of config are undefined and some change', done => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });

            setTimeout(() => {
                const calls = elm.allUndefinedConfigCalls;
                expect(calls.length).toBe(0);

                elm.setParam('p2', 'test');

                setTimeout(() => {
                    const calls = elm.allUndefinedConfigCalls;
                    expect(calls.length).toBe(1);
                    expect(calls[0]).toEqual({ p1: undefined, p2: 'test' });
                    done();
                }, 0);
            }, 0);
        });
    });
});
