function getAllDivs(target) {
    const childs = [...target.shadowRoot.querySelectorAll('x-child')];
    return childs.flatMap((child) => [...child.shadowRoot.querySelectorAll('div')]);
}
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
