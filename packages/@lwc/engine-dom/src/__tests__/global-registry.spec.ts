import { patchCustomElementRegistry } from '../patches/global-registry';

describe('global registry', () => {
    it('throws an error if the global registry is patched twice', () => {
        patchCustomElementRegistry();
        expect(() => {
            patchCustomElementRegistry();
        }).toThrowError(/Please ensure you are loading the LWC engine only once/);
    });
});
