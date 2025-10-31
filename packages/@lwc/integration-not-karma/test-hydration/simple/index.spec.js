/** @type {import('../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        greeting: 'hello!',
    },
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
        expect(p.textContent).toBe('hello!');
        expect(customElements.get(target.tagName.toLowerCase())).not.toBeUndefined();
        expect(customElements.get('c-child')).not.toBeUndefined();

        target.greeting = 'bye!';

        await Promise.resolve();
        expect(p.textContent).toBe('bye!');
    },
};
