export default {
    props: {
        clazz: ''
    },
    clientProps: {
        clazz: 'foo'
    },
    snapshot(target) {
        const child = target.shadowRoot.querySelector('x-child')
        return {
            child,
            h1: child.shadowRoot.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const child = target.shadowRoot.querySelector('x-child')
        const h1 = child.shadowRoot.querySelector('h1');
        expect(child).not.toBe(snapshots.child)
        expect(h1).not.toBe(snapshots.h1);

        TestUtils.expectConsoleCalls(consoleCalls, {
            error: [],
            warn: [
                'Mismatch hydrating element <x-child>: attribute "class" has different values, expected "foo" but found ""',
                "Hydration completed with errors."
            ],
        });
    },
};
