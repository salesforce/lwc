/** @type {import('../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        const span = target.shadowRoot.querySelector('span');

        return {
            span,
        };
    },
    test(elm, snapshot, consoleCalls) {
        const span = elm.shadowRoot.querySelector('span');
        expect(span).toBe(snapshot.span);

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
