import { buildWireAdapterMap } from "../wire-adapters.js";

describe("wire-adapters.js", () => {
    describe("buildWireAdapterMap", () => {
        it("throws on duplicate wire adapter ids", () => {
            const adapter = () => {
                return {"a": () => {}};
            };
            const adapterDup = () => {
                return {"a": () => {}};
            };
            expect(() => {
                buildWireAdapterMap([adapter, adapterDup]);
            }).toThrow();
        });

        it("throws on non-function adapter handler", () => {
            const adapter = () => {
                return {"a": 1};
            };
            expect(() => {
                buildWireAdapterMap([adapter]);
            }).toThrow();
        });

        it("accepts function identifier as adapter id", () => {
            const myFunc = () => {};
            const adapter = () => {
                return { myFunc };
            }
            expect(buildWireAdapterMap([adapter]).size).toBe(1);
        });
    });
});
