import { flushComponentRegistry } from '../../src/framework/def';

// Clean-up after each test the engine component registry. This avoid having the
// engine warning that multiple component class are registered with the same name.
afterEach(() => {
    flushComponentRegistry();
});
