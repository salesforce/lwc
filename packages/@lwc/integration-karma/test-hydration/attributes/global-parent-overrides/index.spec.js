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
        // For static and dynamic
        for (let i = 0; i < 2; i++) {
            expect(divs[0].textContent).toBe(process.env.ENGINE_SERVER);
            expect(divs[1].textContent).toBe(consoleCalls.warn);
            expect(divs[2].textContent).toBe('hidden: true');
            expect(divs[3].textContent).toBe('spellcheck: true');
            expect(divs[4].textContent).toBe('tabindex: -1');
        }

        /**
         * Required because SSR V1 is wrong (parent does not override child) and this results in hydration errors
         */
        if (process.env.ENGINE_SERVER) {
            expect(consoleCalls.warn).toHaveSize(8);
        } else {
            expect(consoleCalls.warn).toHaveSize(0);
        }
        expect(consoleCalls.error).toHaveSize(0);
    },
};
