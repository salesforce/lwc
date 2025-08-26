export default {
    clientProps: {
        foo: 'foo',
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        return {
            div,
            foo: div.getAttribute('data-foo'),
        };
    },
    test(target, snapshots) {
        const div = target.shadowRoot.querySelector('div');
        expect(div).toBe(snapshots.div);
        expect(div.getAttribute('data-foo')).toBe(snapshots.foo);
    },
};
