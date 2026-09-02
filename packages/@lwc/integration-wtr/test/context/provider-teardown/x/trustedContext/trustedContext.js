import {
    connectContext,
    disconnectContext,
    addTrustedContext,
} from '../../../../../helpers/context.js';

// Minimal stand-in for an `@lwc/state` context value (`fromContext(...)`). Being a trusted context
// is what makes the engine register a provider listener on the consuming element.
export function createTrustedContext() {
    const contextVariety = Symbol('context-variety');
    const ctx = {
        [connectContext](binding) {
            // Provide a value so the binding is fully wired, like fromContext(...).
            binding.provideContext(contextVariety, ctx);
        },
        [disconnectContext]() {
            // Consumer-side only; removing the provider listener is the engine's job (what this test checks).
        },
    };
    addTrustedContext(ctx);
    return ctx;
}
