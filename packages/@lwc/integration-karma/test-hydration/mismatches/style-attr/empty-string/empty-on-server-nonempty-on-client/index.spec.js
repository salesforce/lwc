export default {
    props: {
        styles: '',
    },
    clientProps: {
        styles: 'color: burlywood;',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            styles: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe('color: burlywood;');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                `Hydration attribute mismatch on:<p style="color: burlywood;">text</p>
- rendered on server:style=""
- expected on client:style="color: burlywood;"`,
                'Hydration completed with errors.',
            ],
        });
    },
};
