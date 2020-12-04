import { createElement } from 'lwc';

import StaticWiredProps from 'x/staticWiredProps';
import DynamicWiredProps from 'x/dynamicWiredProps';
import SameConfigCase from 'x/sameConfigCase';
import SameAdapterDifferentConfig from 'x/sameAdapterDifferentConfig';

describe('legacy wire adapters (register call)', () => {
    describe('with static config', () => {
        it('should call config when config is empty (@wire(foo)...)', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            document.body.appendChild(elm);

            const calls = elm.emptyConfigCalls;
            expect(calls.length).toBe(1);
            expect(calls[0]).toEqual({});
        });

        it('should call config when config is empty object', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            document.body.appendChild(elm);

            const calls = elm.emptyObjectConfigCalls;
            expect(calls.length).toBe(1);
            expect(calls[0]).toEqual({});
        });

        it('should call config when all props of config are undefined', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            document.body.appendChild(elm);

            const calls = elm.allUndefinedPropsInConfigCalls;
            expect(calls.length).toBe(1);
        });

        it('should call config when at least one prop in config is defined', () => {
            const elm = createElement('x-simple-wire', { is: StaticWiredProps });
            document.body.appendChild(elm);

            const calls = elm.someUndefinedPropsInConfigCalls;
            expect(calls.length).toBe(1);
            expect(calls[0]).toEqual({ p1: 'test', p2: undefined });
        });
    });

    describe('with dynamic config', () => {
        it('should not call config when all initially all props of config are undefined', (done) => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });
            document.body.appendChild(elm);

            setTimeout(() => {
                const calls = elm.allUndefinedConfigCalls;
                expect(calls.length).toBe(0);
                done();
            }, 0);
        });

        it('should call config when at least one prop in config is defined', (done) => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });
            document.body.appendChild(elm);

            setTimeout(() => {
                const calls = elm.someDefinedConfigCalls;
                expect(calls.length).toBe(1);
                expect(calls[0]).toEqual({ p1: undefined, p3: 'test' });

                done();
            }, 0);
        });

        it('should call config when all props become undefined after initialization', (done) => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });
            document.body.appendChild(elm);

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

        it('should call config when initially all props of config are undefined and some change', (done) => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });
            document.body.appendChild(elm);

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

    describe('with dynamic and static config', () => {
        it('should not call config when initially all props from params in config are undefined', (done) => {
            const elm = createElement('x-simple-d-wire', { is: DynamicWiredProps });
            document.body.appendChild(elm);

            setTimeout(() => {
                const calls = elm.mixedAllParamsUndefinedCalls;
                expect(calls.length).toBe(0);
                done();
            }, 0);
        });

        // This following 2 test cases can occur in two scenarios:
        // 1. Because a config param depends on multiple values, some of them change but generates the same config value
        // 2. An issue presented today with the @api decorator, in which whenever the api property is set,
        //    it will force the reactivity system to notify it as a mutation on the component.
        //
        // With the current wire protocol:
        // Case 1) is valid for new wire adapters and should be handled at the adapter level.
        // Case 2) is a loophole in the engine today, but it can be closed without the risk of compromising existing components.
        //
        // With the previous wire protocol:
        // 1) was not possible to reproduce, a config param could only depend on one property from the component, and since
        //    now is possible, existing adapters may behave incorrectly.
        // 2) was handled at the wire-protocol level and existing adapters may behave incorrectly.
        it('should not call config when the generated config is the same as the last one (case 1)', (done) => {
            const elm = createElement('x-same-config', { is: SameConfigCase });
            elm.a = 3;
            elm.b = 2;
            document.body.appendChild(elm);

            setTimeout(() => {
                const firstResult = elm.resultMultipleDependenciesForConfig;
                expect(firstResult.sum).toBe(5);

                elm.a = 1;
                elm.b = 4;

                setTimeout(() => {
                    const secondResult = elm.resultMultipleDependenciesForConfig;

                    // Based on the RFC: every time that `adapter.update()` is invoked, a new config object will
                    // be provided as a first argument, no identity is preserved in this case.
                    expect(firstResult).toBe(secondResult);

                    done();
                });
            });
        });

        it('should not call config when the generated config is the same as the last one (case 2)', (done) => {
            const elm = createElement('x-same-config', { is: SameConfigCase });
            elm.a = 3;
            document.body.appendChild(elm);

            setTimeout(() => {
                const firstResult = elm.resultApiValueDependency;
                expect(firstResult.a).toBe(3);

                // setting same api value
                elm.a = 3;

                setTimeout(() => {
                    const secondResult = elm.resultApiValueDependency;

                    expect(firstResult).toBe(secondResult);

                    done();
                }, 0);
            }, 0);
        });
    });

    describe('with multiple same adapters and different configs', () => {
        it('should invoke multiple wires when component is created', () => {
            const elm = createElement('x-same-adapter-different-config', {
                is: SameAdapterDifferentConfig,
            });
            document.body.appendChild(elm);

            const resultFoo = elm.wireFooData;
            expect(resultFoo.prop).toBe('foo');
            const resultBar = elm.wireBarData;
            expect(resultBar.prop).toBe('bar');
        });
    });
});
