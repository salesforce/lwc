import { CONNECTED, DISCONNECTED, UPDATED } from '../constants';
import * as target from '../wiring';

describe('wiring internal', () => {
    describe('installs setter overrides', () => {
        it("defaults to original value when setter installed", () => {
            class Target {
                prop1 = 'initial';
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, 'prop1', jest.fn());
            expect(cmp.prop1).toBe('initial');
        });
        it("updates original property when installed setter invoked", () => {
            const expected = 'expected';
            class Target {
                prop1;
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, 'prop1', jest.fn());
            cmp.prop1 = expected;
            expect(cmp.prop1).toBe(expected);
        });
        it("installs setter on cmp for property", () => {
            class Target {
                set prop1(value) { /* empty */ }
            }
            const original = Object.getOwnPropertyDescriptor(Target.prototype, "prop1");
            const cmp = new Target();
            target.installSetterOverrides(cmp, 'prop1', jest.fn());
            const descriptor = Object.getOwnPropertyDescriptor(cmp, "prop1");
            if (descriptor && original) {
                expect(descriptor.set).not.toBe(original.set);
            }
        });
        it("invokes original setter when installed setter invoked", () => {
            const setter = jest.fn();
            const expected = 'expected';
            class Target {
                set prop1(value) {
                    setter(value);
                }
                get prop1() { return ''; }
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, 'prop1', jest.fn());
            cmp.prop1 = expected;
            expect(setter).toHaveBeenCalledTimes(1);
            expect(setter).toHaveBeenCalledWith(expected);
        });
    });

    describe('builds wire service context', () => {
        it('includes connected callback if any', () => {
            expect(target.buildContext([jest.fn()], [], {})[CONNECTED]).toHaveLength(1);
        });
        it('includes disconnected callback if any', () => {
            expect(target.buildContext([], [jest.fn()], {})[DISCONNECTED]).toHaveLength(1);
        });
        it('includes updated callback config if any', () => {
            const updatedCallbackConfigs = [{
                updatedCallback: jest.fn()
            }];
            const serviceUpdateContext = { prop: updatedCallbackConfigs };
            expect(target.buildContext([], [], serviceUpdateContext)[UPDATED]).toEqual(serviceUpdateContext);
        });
    });
});
