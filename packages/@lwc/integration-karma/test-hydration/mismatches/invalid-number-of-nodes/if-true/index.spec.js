export default {
    props: {
        showBlue: true,
    },
    clientProps: {
        showBlue: false,
    },
    snapshot(target) {
        return {
            text: target.shadowRoot.firstChild.innerText,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.text).not.toBe(snapshots.text);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                `Hydration child node mismatch on:<ul><li>red</li><li>blue</li></ul>
- rendered on server:<li>red</li>,<li>blue</li>,<li>green</li>
- expected on client:<li>red</li>,,<li>blue</li>`,
                'Hydration completed with errors.',
            ],
        });
    },
};
