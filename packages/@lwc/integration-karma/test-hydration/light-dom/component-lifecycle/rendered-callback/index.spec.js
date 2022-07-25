export default {
    snapshot(target) {
        const p = target.querySelector('p');
        return {
            p,
            text: p.firstChild,
        };
    },
    test(target, snapshots) {
        const p = target.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);
        expect(p.textContent).toBe('renderedCallback:false');

        return Promise.resolve().then(() => {
            expect(p.textContent).toBe('renderedCallback:true');
        });
    },
};
