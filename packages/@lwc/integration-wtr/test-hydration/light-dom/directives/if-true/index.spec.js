/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        control: true,
    },
    snapshot(target) {
        return {
            p: target.querySelector('p'),
        };
    },
    async test(target, snapshots) {
        expect(target.querySelector('p')).toBe(snapshots.p);

        target.control = false;

        await Promise.resolve();
        expect(target.querySelector('p')).toBeNull();
    },
};
