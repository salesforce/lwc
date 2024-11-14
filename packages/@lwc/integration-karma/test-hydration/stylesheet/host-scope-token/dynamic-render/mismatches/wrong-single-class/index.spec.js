export default {
    props: {
        clazz: 'foo',
    },
    clientProps: {
        clazz: 'bar',
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
        expect(child).not.toBe(snapshots.child);
        expect(h1).not.toBe(snapshots.h1);

        TestUtils.expectConsoleCalls(consoleCalls, {
            error: [],
            warn: [
                'Mismatch hydrating element <x-child>: attribute "class" has different values, expected "bar" but found "foo"',
                'Hydration completed with errors.',
            ],
        });
    },
};
