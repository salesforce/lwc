export default {
    props: {
        dynamicStyle: 'background-color: red; border-color: red; margin: 1px;',
    },
    clientProps: {
        dynamicStyle: 'background-color: red; border-color: red;',
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
        expect(p.getAttribute('style')).toBe('background-color: red; border-color: red;');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                `Hydration attribute mismatch on:<p style="background-color: red; border-color: red;">txt</p>
- rendered on server:style="background-color: red; border-color: red; margin: 1px;"
- expected on client:style="background-color: red; border-color: red;"`,
                'Hydration completed with errors.',
            ],
        });
    },
};
