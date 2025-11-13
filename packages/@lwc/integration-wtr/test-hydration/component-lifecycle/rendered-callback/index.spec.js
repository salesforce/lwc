/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            text: p.firstChild,
        };
    },
    async test(target, snapshots) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);
        expect(p.textContent).toBe('renderedCallback:false');

        await Promise.resolve();
        expect(p.textContent).toBe('renderedCallback:true');
    },
};
