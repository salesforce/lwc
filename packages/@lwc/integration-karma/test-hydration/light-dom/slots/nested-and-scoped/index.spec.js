export default {
    props: {},
    snapshot(target) {
        const cmpChild = target.querySelector('x-child');
        const cmpChildDiv = target.querySelector('x-child div');
        const [cmpScopedOuter, cmpScopedInner] = target.querySelectorAll('x-scoped');

        return {
            target,
            cmpScopedOuter,
            cmpScopedInner,
            cmpChild,
            cmpChildDiv,
        };
    },
    advancedTest(target, { Component, hydrateComponent, consoleSpy, container, selector }) {
        const snapshotBeforeHydration = this.snapshot(target);
        hydrateComponent(target, Component, this.props);
        const hydratedTarget = container.querySelector(selector);
        const snapshotAfterHydration = this.snapshot(hydratedTarget);

        for (const snapshotKey of Object.keys(snapshotBeforeHydration)) {
            expect(snapshotBeforeHydration[snapshotKey])
                .withContext(
                    `${snapshotKey} should be the same DOM element both before and after hydration`
                )
                .toBe(snapshotAfterHydration[snapshotKey]);
        }

        for (const snapshotKey of ['target', 'cmpScopedOuter', 'cmpScopedInner']) {
            expect(snapshotBeforeHydration[snapshotKey].childNodes)
                .withContext(
                    `${snapshotKey} should have the same number of child nodes before & after hydration`
                )
                .toHaveSize(snapshotAfterHydration[snapshotKey].childNodes.length);
        }

        expect(consoleSpy.calls.warn).toHaveSize(0);
        expect(consoleSpy.calls.error).toHaveSize(0);
    },
};
