import { WiredValue } from "../wired-value.js";

describe("wired-value.js", () => {
    it("data and error undefined by default", () => {
        const wiredValue = new WiredValue();
        expect(wiredValue.data).toBe(undefined);
        expect(wiredValue.error).toBe(undefined);
    });

    describe("update()", () => {
        it("sets new value on config", () => {
            const config = { "foo": "original value" };
            const wiredValue = new WiredValue(undefined, config);
            wiredValue.provide = jest.fn();
            wiredValue.update("foo", "new value");
            expect(wiredValue.config.foo).toBe("new value");
        });
        it("calls provide() when new value set", () => {
            const config = { "foo": "original value" };
            const wiredValue = new WiredValue(undefined, config);
            wiredValue.provide = jest.fn();
            wiredValue.update("foo", "new value");
            expect(wiredValue.provide).toHaveBeenCalled();
        });
        it("does not call provide() when same value set", () => {
            const config = { "foo": "original value" };
            const wiredValue = new WiredValue(undefined, config);
            wiredValue.provide = jest.fn();
            wiredValue.update("foo", "original value");
            expect(wiredValue.provide).not.toHaveBeenCalled();
        });
        it("calls release() when new value set", () => {
            const config = { "foo": "original value" };
            const wiredValue = new WiredValue(undefined, config);
            wiredValue.release = jest.fn();
            wiredValue.provide = jest.fn();
            wiredValue.update("foo", "new value");
            expect(wiredValue.release).toHaveBeenCalled();
        });
        it("does not call release() when same value set", () => {
            const config = { "foo": "original value" };
            const wiredValue = new WiredValue(undefined, config);
            wiredValue.release = jest.fn();
            wiredValue.provide = jest.fn();
            wiredValue.update("foo", "original value");
            expect(wiredValue.release).not.toHaveBeenCalled();
        });
    });

    describe("provide()", () => {
        it("calls _provide()", done => {
            const wiredValue = new WiredValue();
            wiredValue._provide = jest.fn(() => done());
            wiredValue.provide();
        });
        it("multiple invocations calls _provide() once", () => {
            const wiredValue = new WiredValue();
            const mock = jest.fn();
            wiredValue._provide = mock;
            wiredValue.provide();
            wiredValue.provide();
            return Promise.resolve().then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("install()", () => {
        it("wired field - assigns object with only data and error", () => {
            const cmp = {};
            const propName = "target";
            const wiredValue = new WiredValue(jest.fn(), {}, false, cmp, propName);
            wiredValue.install();
            expect(cmp[propName]).toEqual({ data: undefined, error: undefined });
        });
        it("wired method - does not assign self to component", () => {
            const cmp = {};
            const propName = "target";
            const wiredMethod = jest.fn();
            cmp[propName] = wiredMethod;
            const wiredValue = new WiredValue(jest.fn(), {}, true, cmp, propName);
            wiredValue.install();
            expect(cmp[propName]).toBe(wiredMethod);
        });
    });

    describe("_provide()", () => {
        it("calls adapter with config", () => {
            const adapter = jest.fn();
            const config = "expected";
            const wiredValue = new WiredValue(adapter, config);
            wiredValue.release = jest.fn();
            wiredValue._provide();
            expect(adapter).toHaveBeenCalledWith(config);
        });
        it("calls subscribe on adapter's return", () => {
            const mock = jest.fn();
            const adapter = () => {
                return {
                    subscribe: mock
                };
            };
            const config = {};
            const wiredValue = new WiredValue(adapter, config);
            wiredValue._provide();
            expect(mock).toHaveBeenCalledTimes(1);
        });
        it("sets subscription from adapter's observable.subscribe() return", () => {
            const expected = "expected";
            const adapter = () => {
                return {
                    subscribe: () => {
                        return expected;
                    }
                };
            };
            const config = {};
            const wiredValue = new WiredValue(adapter, config);
            wiredValue._provide();
            expect(wiredValue.subscription).toBe(expected);
        });
    });

    describe("getObserver()", () => {
        it("wired field - next sets data, clears error", () => {
            const expected = { value: "foo" };
            const cmp = {};
            const wiredValue = new WiredValue(jest.fn(), {}, false, cmp, "target");
            wiredValue.install();
            const observer = wiredValue.getObserver();
            observer.next(expected);
            expect(cmp.target.data).toBe(expected);
            expect(cmp.target.error).toBe(undefined);
        });
        it("wired field - error sets error, clears data", () => {
            const expected = new Error("error");
            const cmp = {};
            const wiredValue = new WiredValue(jest.fn(), {}, false, cmp, "target");
            wiredValue.install();
            const observer = wiredValue.getObserver();
            observer.error(expected);
            expect(cmp.target.data).toBe(undefined);
            expect(cmp.target.error).toBe(expected);
        });
        it("wired field - complete invokes completeHandler, leaves data", () => {
            const expected = { value: "foo" };
            const mock = jest.fn();
            const cmp = {};
            const wiredValue = new WiredValue(jest.fn(), {}, false, cmp, "target");
            wiredValue.install();
            const observer = wiredValue.getObserver();
            wiredValue.completeHandler = mock;
            observer.next(expected);
            observer.complete();
            expect(mock).toHaveBeenCalledTimes(1);
            expect(cmp.target.data).toBe(expected);
            expect(cmp.target.error).toBe(undefined);
        });
        it("wired method - next invokes method with value, no error", () => {
            const expected = { value: "foo" };
            const cmp = {
                target: jest.fn()
            };
            const wiredValue = new WiredValue(jest.fn(), {}, true, cmp, "target");
            wiredValue.install();
            const observer = wiredValue.getObserver();
            observer.next(expected);
            expect(cmp.target.mock.calls).toHaveLength(1);
            expect(cmp.target.mock.calls[0][0].error).toBe(undefined);
            expect(cmp.target.mock.calls[0][0].data).toBe(expected);
        });
        it("wired method - error invokes method with error, no value", () => {
            const expected = {};
            const cmp = {
                target: jest.fn()
            };
            const wiredValue = new WiredValue(jest.fn(), {}, true, cmp, "target");
            wiredValue.install();
            const observer = wiredValue.getObserver();
            observer.error(expected);
            expect(cmp.target.mock.calls).toHaveLength(1);
            expect(cmp.target.mock.calls[0][0].error).toBe(expected);
            expect(cmp.target.mock.calls[0][0].data).toBe(undefined);
        });
        it("wired method - complete invokes completeHandler, does not invoke method", () => {
            const expected = { value: "foo" };
            const mock = jest.fn();
            const cmp = {
                target: jest.fn()
            };
            const wiredValue = new WiredValue(jest.fn(), {}, true, cmp, "target");
            wiredValue.install();
            wiredValue.completeHandler = mock;
            const observer = wiredValue.getObserver();
            observer.next(expected);
            observer.complete();
            expect(mock).toHaveBeenCalledTimes(1);
            expect(cmp.target.mock.calls).toHaveLength(1);
        });
    });

    describe("completeHandler()", () => {
        it("calls release then provide()", () => {
            const wiredValue = new WiredValue();
            const mock = jest.fn();
            wiredValue.provide = mock;
            wiredValue.completeHandler();
            expect(mock).toHaveBeenCalledTimes(1);
        });
        it("avoids provide storm by limiting provide() invocations", () => {
            const wiredValue = new WiredValue();
            const mock = jest.fn();
            wiredValue.provide = mock;
            wiredValue.completeHandler();
            wiredValue.completeHandler();
            expect(mock).toHaveBeenCalledTimes(1);
        });
    });

    describe("release()", () => {
        it("calls unsubscribe()", () => {
            const mock = jest.fn();
            const wiredValue = new WiredValue();
            wiredValue.subscription = {};
            wiredValue.subscription.unsubscribe = mock;
            wiredValue.release();
            expect(mock).toHaveBeenCalledTimes(1);
        });
        it("multiple invocations calls unsubscribe() once", () => {
            const mock = jest.fn();
            const wiredValue = new WiredValue();
            wiredValue.subscription = {};
            wiredValue.subscription.unsubscribe = mock;
            wiredValue.release();
            wiredValue.release();
            expect(mock).toHaveBeenCalledTimes(1);
        });
    });
});
