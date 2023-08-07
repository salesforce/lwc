export default {
    props: {
        content: '<p>test-content</p>',
    },
    clientProps: {
        content: '<p>different-content</p>',
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        const p = div.querySelector('p');
        return {
            div,
            p,
        };
    },
    test(target, snapshot, consoleCalls) {
        const div = target.shadowRoot.querySelector('div');
        const p = div.querySelector('p');

        expect(div).toBe(snapshot.div);
        expect(p).not.toBe(snapshot.p);
        expect(p.textContent).toBe('different-content');

        expect(consoleCalls.warn).toHaveSize(1);
        expect(consoleCalls.warn[0][0].message).toContain(
            'Mismatch hydrating element <div>: innerHTML values do not match for element, will recover from the difference'
        );

        target.content = '<p>another-content</p>';

        return Promise.resolve().then(() => {
            expect(div.textContent).toBe('another-content');
        });
    },
};
