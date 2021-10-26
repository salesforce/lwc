export default {
    snapshot(target) {
        return {
            div: target.shadowRoot.querySelector('div'),
        };
    },
    test(target, snapshots) {
        const div = target.shadowRoot.querySelector('div');

        expect(div).toBe(snapshots.div);
        expect(div.innerHTML).toBe('<p>test</p>');
    },
};
