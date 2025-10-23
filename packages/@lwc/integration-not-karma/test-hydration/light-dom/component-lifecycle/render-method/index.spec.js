/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        useTplA: true,
    },
    snapshot(target) {
        const p = target.querySelector('p');
        return {
            p,
            text: p.firstChild,
        };
    },
    async test(target, snapshots) {
        const p = target.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);
        expect(p.textContent).toBe('template A');

        target.useTplA = false;

        await Promise.resolve();
        expect(target.querySelector('p').textContent).toBe('template B');
    },
};
