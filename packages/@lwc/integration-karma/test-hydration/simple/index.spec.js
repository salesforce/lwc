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
    test(target, snapshots) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);
        expect(p.textContent).toBe('hello!');

        target.greeting = 'bye!';

        return Promise.resolve().then(() => {
            expect(p.textContent).toBe('bye!');
        });
    },
};
