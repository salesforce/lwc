import registerWireService from "../main.js";

describe("main.js", () => {
    describe("registerWireService()", () => {
        const mockAdapters = () => {
            return {};
        };

        it("registers for wiring hook", () => {
            const register = jest.fn();
            registerWireService(register, mockAdapters);
            expect(register).toHaveBeenCalledWith(expect.objectContaining({
                wiring: expect.any(Function)
            }));
        });
        // TODO W-4072588 - support connected + disconnected (repeated) cycles
        it.skip("registers for connected hook", () => {
            const register = jest.fn();
            registerWireService(register, mockAdapters);
            expect(register).toHaveBeenCalledWith(expect.objectContaining({
                connected: expect.any(Function)
            }));
        });
        it("registers for disconnected hook", () => {
            const register = jest.fn();
            registerWireService(register, mockAdapters);
            expect(register).toHaveBeenCalledWith(expect.objectContaining({
                disconnected: expect.any(Function)
            }));
        });
        it("allows wire service to register wire adapter", () => {
            const register = jest.fn();
            const wireService = registerWireService(register, mockAdapters);
            expect(wireService.register).toBeDefined();
        });
        it("allows wire service to unregister wire adapter", () => {
            const register = jest.fn();
            const wireService = registerWireService(register, mockAdapters);
            expect(wireService.unregister).toBeDefined();
        });
    });
});
