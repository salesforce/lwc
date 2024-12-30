export default {
    props: {
        isServer: true,
    },
    clientProps: {
        isServer: false,
    },
    snapshot(target) {
        return {
            childMarkup: target.shadowRoot.firstChild.firstChild.shadowRoot.innerHTML,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.childMarkup).not.toBe(snapshots.childMarkup);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                `Hydration child node mismatch on:<x-child></x-child>
- rendered on server:<div>foo</div>
- expected on client:<div>foo</div>,<div>bar</div>`,
                'Hydration completed with errors.',
            ],
        });
    },
};
