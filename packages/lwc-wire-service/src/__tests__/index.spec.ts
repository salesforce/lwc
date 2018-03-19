import {
    registerWireService,
} from '../index';

describe('wire service', () => {
    describe('registers the service with engine', () => {
        it('supports wiring hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(expect.objectContaining({
                wiring: expect.any(Function)
            }));
        });
        it('supports connected hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(expect.objectContaining({
                connected: expect.any(Function)
            }));
        });
        it('supports disconnected hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(expect.objectContaining({
                disconnected: expect.any(Function)
            }));
        });
    });
});
