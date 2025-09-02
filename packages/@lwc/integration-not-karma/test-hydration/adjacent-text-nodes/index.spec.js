export default {
    props: {},
    snapshot(target) {
        const first = target.shadowRoot.querySelector('.first');
        const second = target.shadowRoot.querySelector('.second');

        return {
            first,
            second,
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
