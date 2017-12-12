import * as target from "../wire-service.js";

describe("wire-service.js", () => {
    describe("getPropToParams()", () => {
        it("throws when dynamic param is also static", () => {
            const wireDef = {
                params: { staticAndDynamic: "prop1" },
                static: { staticAndDynamic: "foo" }
            };
            expect(() => {
                target.getPropToParams(wireDef, "target");
            }).toThrow();
        });
        it("maps a single prop to a single param", () => {
            const expected = {
                prop1: ["param1"]
            };
            const wireDef = {
                params: { param1: "prop1" },
                static: {}
            };
            const propToParams = target.getPropToParams(wireDef, "target");
            expect(propToParams).toMatchObject(expected);
        });
        it("maps a single prop to multiple params", () => {
            const expected = {
                prop1: ["param1", "param2"]
            };
            const wireDef = {
                params: { param1: "prop1", param2: "prop1" },
                static: {}
            };
            const propToParams = target.getPropToParams(wireDef, "target");
            expect(propToParams).toMatchObject(expected);
        });
        it("maps multiple props to multiple params", () => {
            const expected = {
                prop1: ["param1", "param2"],
                prop2: ["param3"]
            };
            const wireDef = {
                params: { param1: "prop1", param2: "prop1", param3: "prop2" },
                static: {}
            };
            const propToParams = target.getPropToParams(wireDef, "target");
            expect(propToParams).toMatchObject(expected);
        });
    });

    describe("getAdapter()", () => {
        const adapters = () => {
            return { known: () => { } };
        };
        target.setWireAdapters([adapters]);

        it("throws with an unknown adapter id", () => {
            const wireDef = { type: "unknown" };
            expect(() => {
                target.getAdapter(wireDef, "target");
            }).toThrow();
        });
        it("returns with a known adapter id", () => {
            const wireDef = { type: "known" };
            target.getAdapter(wireDef, "target");
        });
    });

    describe("getStaticConfig()", () => {
        it("maps a single prop to a single param", () => {
            const expected = {
                param1: "prop1",
                param2: "prop2"
            };
            const wireDef = {
                params: { param3: "prop3" },
                static: expected
            };
            const propToParams = target.getStaticConfig(wireDef);
            expect(propToParams).toMatchObject(expected);
        });
    });

    describe("getPropChangeHandlers()", () => {
        it("maps one prop to one param to one handler", () => {
            const wireConfigs = {
                target: {
                    propToParams: { "prop1": ["param1"] }
                }
            };
            const wiredValues = {
                target: { update: () => { } }
            };
            const handlers = target.getPropChangeHandlers(wireConfigs, wiredValues);
            expect(handlers.prop1.length).toBe(1);
        });
        it("maps one prop to multiple params to multiple hanlders for one prop", () => {
            const wireConfigs = {
                target: {
                    propToParams: { "prop1": ["param1", "param2"] }
                }
            };
            const wiredValues = {
                target: { update: () => { } }
            };
            const handlers = target.getPropChangeHandlers(wireConfigs, wiredValues);
            expect(handlers.prop1.length).toBe(2);
        });
        it("maps same prop from multiple wires to multiple handlers for one prop", () => {
            const wireConfigs = {
                target1: {
                    propToParams: { "prop1": ["param1"] }
                },
                target2: {
                    propToParams: { "prop1": ["param1"] }
                }
            };
            const wiredValues = {
                target1: { update: () => { } },
                target2: { update: () => { } }
            };
            const handlers = target.getPropChangeHandlers(wireConfigs, wiredValues);
            expect(handlers.prop1.length).toBe(2);
        });
        it("binds param name to WiredValue.update", () => {
            const wireConfigs = {
                target: {
                    propToParams: { "prop1": ["param1", "param2"] }
                }
            };
            let actual;
            const update = (param) => {
                actual = param;
            };
            const wiredValues = {
                target: { update }
            };
            const handlers = target.getPropChangeHandlers(wireConfigs, wiredValues);
            handlers.prop1[0]("newValue1");
            expect(actual).toBe("param1");
            handlers.prop1[1]("newValue2");
            expect(actual).toBe("param2");
        });
    });

    describe("installSetterOverrides()", () => {
        it("defaults to original value when setter installed", () => {
            class Target {
                prop1 = 'initial'
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, { prop1: [jest.fn()] });
            expect(cmp.prop1).toBe('initial');
        });
        it("updates original property when installed setter invoked", () => {
            const expected = 'expected';
            class Target {
                prop1;
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, { prop1: [jest.fn()] });
            cmp.prop1 = expected;
            expect(cmp.prop1).toBe(expected);
        });
        it("installs setter on cmp for property", () => {
            class Target {
                set prop1(value) { /* empty */ }
            }
            const original = Object.getOwnPropertyDescriptor(Target.prototype, "prop1");
            const cmp = new Target();
            target.installSetterOverrides(cmp, { prop1: "empty" });
            const descriptor = Object.getOwnPropertyDescriptor(cmp, "prop1");
            expect(descriptor.set).not.toBe(original.set);
        });
        it("invokes original setter when installed setter invoked", () => {
            const setter = jest.fn();
            const expected = 'expected';
            class Target {
                set prop1(value) {
                    setter(value);
                }
                get prop1() { /* empty */ }
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, { prop1: [jest.fn()] });
            cmp.prop1 = expected;
            expect(setter).toHaveBeenCalledTimes(1);
            expect(setter).toHaveBeenCalledWith(expected);
        });

        it("invokes original getter once when installed setter invoked", () => {
            const getter = jest.fn();
            class Target {
                set prop1(value) { /* empty */ }
                get prop1() {
                    getter();
                }
            }
            const cmp = new Target();
            target.installSetterOverrides(cmp, { prop1: [jest.fn()] });
            cmp.prop1 = '';
            expect(getter).toHaveBeenCalledTimes(1);
        });
        it("uses getter return value, not setter argument value, as the new value", () => {
            const expected = 1;
            class Target {
                set prop1(value) { /* empty */ }
                get prop1() {
                    return expected;
                }
            }
            const cmp = new Target();
            const handler = jest.fn();
            target.installSetterOverrides(cmp, { prop1: [handler] });
            cmp.prop1 = expected + 1; // a different value than the getter's return value
            expect(handler).toHaveBeenCalledWith(expected);
        });
    });
});
