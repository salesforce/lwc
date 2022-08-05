export default {
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            text: p.firstChild,
        };
    },
    test(target, snapshots, consoleCalls) {
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);

        const p = target.shadowRoot.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);

        expect(p.textContent).toBe('123');
        expect(p.getAttribute('class')).toBe('123');
        expect(p.getAttribute('data-attr')).toBe('123');
    },
};
