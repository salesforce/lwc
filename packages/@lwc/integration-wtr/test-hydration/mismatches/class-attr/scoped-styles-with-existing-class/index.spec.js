/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        const [div1, div2] = target.shadowRoot.querySelectorAll('div');
        return {
            div1,
            div2,
        };
    },
    test(target, snapshots, consoleCalls) {
        const [div1, div2] = target.shadowRoot.querySelectorAll('div');

        expect(div1).toBe(snapshots.div1);
        expect(div2).toBe(snapshots.div2);

        // TODO [#4714]: Scope token classes render in an inconsistent order for static vs dynamic classes
        expect(new Set(div1.classList)).toEqual(new Set(['foo', 'lwc-6958o7oup43']));
        expect(new Set(div2.classList)).toEqual(new Set(['bar', 'lwc-6958o7oup43']));

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
