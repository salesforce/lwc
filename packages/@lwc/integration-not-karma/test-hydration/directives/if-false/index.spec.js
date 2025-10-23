/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        control: false,
    },
    snapshot(target) {
        return {
            p: target.shadowRoot.querySelector('p'),
        };
    },
    async test(target, snapshots) {
        expect(target.shadowRoot.querySelector('p')).toBe(snapshots.p);

        target.control = true;

        await Promise.resolve();
        expect(target.shadowRoot.querySelector('p')).toBeNull();
    },
};
