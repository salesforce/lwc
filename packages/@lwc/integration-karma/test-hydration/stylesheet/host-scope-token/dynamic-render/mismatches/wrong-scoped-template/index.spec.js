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
            classList: new Set([...child.classList]),
            h1: child.shadowRoot.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const child = target.shadowRoot.querySelector('x-child');
        const h1 = child.shadowRoot.querySelector('h1');

        // <x-child> is not considered mismatched but its children are
        expect(child).toBe(snapshots.child);
        expect(h1).not.toBe(snapshots.h1);

        expect(
            getComputedStyle(child).getPropertyValue('--from-template').trim().replace(/"/g, "'")
        ).toBe("'a'");

        TestUtils.expectConsoleCalls(consoleCalls, {
            error: [],
            warn: [
                'Mismatch hydrating element <style>: attribute "class" has different values, expected "lwc-2fs4h5b0o15" but found "lwc-3hsmkt14797"',
                'Mismatch hydrating element <h1>: attribute "class" has different values, expected "lwc-2fs4h5b0o15" but found "lwc-3hsmkt14797"',
                'Hydration completed with errors.',
            ],
        });
    },
};
