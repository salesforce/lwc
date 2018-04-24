import {
    registerWireService,
    register
} from '../index';

describe('wire service', () => {
    describe('registers the service with engine', () => {
        it('uses wiring hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(expect.objectContaining({
                wiring: expect.any(Function)
            }));
        });
        it('uses connected hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(expect.objectContaining({
                connected: expect.any(Function)
            }));
        });
        it('uses disconnected hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(expect.objectContaining({
                disconnected: expect.any(Function)
            }));
        });
    });
});

describe('register', () => {
    // TODO - reject non-function adapter id once we migrate all uses
    it('accepts function as adapter id', () => {
        function getAdapter() { /**/ }
        function getWireAdapter(wireEventTarget) { /**/ }
        register(getAdapter, getWireAdapter);
    });
    it('accepts string as adapter id', () => {
        function getWireAdapter(wireEventTarget) { /**/ }
        register('getAdapter', getWireAdapter);
    });
    it('throws when adapter id is not truthy', () => {
        function getWireAdapter(wireEventTarget) { /**/ }
        expect(() => register(undefined, getWireAdapter)).toThrowError('adapter id must be truthy');
    });
    it('throws when adapter factory is not a function', () => {
        function getAdapter() { /**/ }
        expect(() => register(getAdapter, {} as any)).toThrowError('adapter factory must be a callable');
    });
});
