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

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <x-child> - rendered on server: class="foo" - expected on client: class="bar"',
                'Hydration completed with errors.',
            ],
        });
    },
};
