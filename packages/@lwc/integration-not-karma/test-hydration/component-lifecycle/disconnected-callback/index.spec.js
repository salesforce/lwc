let disconnectedCalled = false;

// NOTE: Disconnected callback is not triggered by Node.remove, see: https://github.com/salesforce/lwc/issues/1102
// That's why we trick it by removing a component via the diffing algo.
/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        showFoo: true,
        disconnectedCb: () => {
            disconnectedCalled = true;
        },
    },
    snapshot(target) {
        return {
            xFoo: target.shadowRoot.querySelector('c-foo'),
        };
    },
    async test(target, snapshots) {
        const xFoo = target.shadowRoot.querySelector('c-foo');
        expect(xFoo).not.toBe(null);
        expect(xFoo).toBe(snapshots.xFoo);

        target.showFoo = false;

        await Promise.resolve();
        expect(disconnectedCalled).toBe(true);
    },
};
