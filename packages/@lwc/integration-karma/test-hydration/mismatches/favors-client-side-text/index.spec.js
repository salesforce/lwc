export default {
    props: {
        greeting: 'hello!',
    },
    clientProps: {
        greeting: 'bye!',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            text: p.firstChild,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);
        expect(p.textContent).toBe('bye!');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Hydration mismatch: text values do not match, will recover from the difference',
            ],
        });
    },
};
