export default {
    props: {
        content: '<p>test-content</p>',
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        return {
            div,
            p: div.querySelector('p'),
        };
    },
    test(target, snapshot) {
        const div = target.shadowRoot.querySelector('div');
        const p = div.querySelector('p');

        expect(div).toBe(snapshot.div);
        expect(p).not.toBe(snapshot.p); // this paragraph is added as .innerHtml

        expect(p.textContent).toBe('test-content');
    },
};
