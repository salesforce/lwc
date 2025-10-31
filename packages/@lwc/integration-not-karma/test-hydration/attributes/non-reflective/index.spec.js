function getAllDivs(target) {
    const childs = [...target.shadowRoot.querySelectorAll('c-child')];
    return childs.flatMap((child) => [...child.shadowRoot.querySelectorAll('div')]);
}
/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        const divs = getAllDivs(target);
        return { divs };
    },
    test(target, snapshots, consoleCalls) {
        const divs = getAllDivs(target);
        expect(divs.length).toBe(snapshots.divs.length);
        for (let i = 0; i < divs.length; i += 1) {
            expect(divs[i]).toBe(snapshots.divs[i]);
        }
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
