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
    test(target, snapshot) {
        const div = target.querySelector('div');
        const p = div.querySelector('p');

        expect(div).toBe(snapshot.div);
        expect(p).toBe(snapshot.p);
        expect(p.textContent).toBe(snapshot.text);
    },
};
