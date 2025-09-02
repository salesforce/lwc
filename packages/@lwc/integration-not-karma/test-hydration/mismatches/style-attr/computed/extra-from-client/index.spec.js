export default {
    props: {
        dynamicStyle: 'background-color: red; border-color: red;',
    },
    clientProps: {
        dynamicStyle: 'background-color: red; border-color: red; margin: 1px;',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).not.toBe(snapshots.style);
        expect(p.getAttribute('style')).toBe(
            'background-color: red; border-color: red; margin: 1px;'
        );

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: style="background-color: red; border-color: red;" - expected on client: style="background-color: red; border-color: red; margin: 1px;"',
                'Hydration completed with errors.',
            ],
        });
    },
};
