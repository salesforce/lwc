export default {
    snapshot(target) {
        return {
            parent: target,
            child: target.querySelector('x-child'),
        };
    },
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        const { parent, child } = this.snapshot(target);
        hydrateComponent(target, Component, {});
        const consoleCalls = consoleSpy.calls;
        // Validate there is no class attribute mismatch
        expect(consoleCalls.error).toHaveSize(0);
        // Validate there is no hydration mismatch
        expect(parent).toBe(target);
        expect(child).toBe(target.querySelector('x-child'));
    },
};
