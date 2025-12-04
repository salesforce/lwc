/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        content: '<p>test-content</p>',
    },
    snapshot(target) {
        const div = target.querySelector('div');
        const p = div.querySelector('p');
        return {
            div,
            p,
            text: p.textContent,
        };
    },
    test(target, snapshot, consoleCalls) {
        const div = target.querySelector('div');
        const p = div.querySelector('p');

        expect(div).toBe(snapshot.div);
        expect(p).toBe(snapshot.p);
        expect(p.textContent).toBe(snapshot.text);

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
