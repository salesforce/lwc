/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        label: 'dynamic',
    },
    snapshot(target) {
        const cmp = target.shadowRoot.querySelector('c-child');
        const p = cmp.shadowRoot.querySelector('p');

        return {
            cmp,
            p,
        };
    },
    test(target, snapshots) {
        const cmp = target.shadowRoot.querySelector('c-child');
        const p = cmp.shadowRoot.querySelector('p');

        expect(cmp).toBe(snapshots.cmp);
        expect(p).toBe(snapshots.p);
        expect(p.textContent).toBe('dynamic');
    },
};
