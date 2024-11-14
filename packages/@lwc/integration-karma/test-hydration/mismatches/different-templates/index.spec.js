export default {
    props: {
        showA: false,
    },
    clientProps: {
        showA: true,
    },
    snapshot(target) {
        const child = target.shadowRoot.querySelector('x-child');
        return {
            child,
            h1: child.shadowRoot.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const child = target.shadowRoot.querySelector('x-child');
        const h1 = child.shadowRoot.querySelector('h1');

        expect(child).toBe(snapshots.child);
        // <h1> is not considered mismatched, only its text content
        expect(h1).toBe(snapshots.h1);
        expect(h1.textContent).toBe('a');

        TestUtils.expectConsoleCalls(consoleCalls, {
            error: [],
            warn: [
                'Hydration mismatch: text values do not match, will recover from the difference\n<x-child>',
            ],
        });
    },
};
