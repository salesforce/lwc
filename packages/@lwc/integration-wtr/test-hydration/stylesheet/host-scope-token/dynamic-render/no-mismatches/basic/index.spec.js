/** @type {import('../../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        const child = target.querySelector('x-child');
        return {
            child,
            classList: new Set([...child.classList]),
            h1: target.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const child = target.querySelector('x-child');
        const h1 = target.querySelector('h1');
        expect(child).toBe(snapshots.child);
        expect(h1).toBe(snapshots.h1);

        expect(new Set([...child.classList])).toEqual(snapshots.classList);

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
