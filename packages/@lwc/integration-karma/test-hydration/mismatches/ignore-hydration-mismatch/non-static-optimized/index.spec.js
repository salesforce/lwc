export default {
    props: {
        isSsr: true,
    },
    clientProps: {
        isSsr: false,
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');

        return {
            div,
        };
    },
    test(target, snapshots, consoleCalls) {
        const { div } = this.snapshot(target);
        expect(div).toBe(snapshots.div);
        expect(div.getAttribute('data-lwc-ignore-hydration-mismatch')).toBe('true');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [],
            error: [],
        });
    },
};
