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
        // dynamic
        expect(divs[0].textContent).toBe('id: parentProvided');
        expect(divs[1].textContent).toBe('draggable: true');
        expect(divs[2].textContent).toBe('hidden: true');
        expect(divs[3].textContent).toBe('spellcheck: true');
        expect(divs[4].textContent).toBe('tabindex: -1');
        // static
        expect(divs[5].textContent).toBe('id: parentProvided');
        expect(divs[6].textContent).toBe('draggable: true');
        expect(divs[7].textContent).toBe('hidden: true');
        expect(divs[8].textContent).toBe('spellcheck: true');
        expect(divs[9].textContent).toBe('tabindex: -1');

        /**
         * Required because SSR V1 is wrong (parent does not override child) and this results in hydration errors
         */
        if (process.env.ENGINE_SERVER && process.env.NODE_ENV !== 'production') {
            expect(consoleCalls.warn.toString()).toContain('Hydration text content mismatch');
        } else {
            expect(consoleCalls.warn).toHaveSize(0);
        }
        expect(consoleCalls.error).toHaveSize(0);
    },
};
