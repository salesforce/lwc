export default {
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        return {
            div,
            class: div.getAttribute('class'),
        };
    },
    test(target, snapshots) {
        const div = target.shadowRoot.querySelector('div');
        expect(div).toBe(snapshots.div);
        expect(div.getAttribute('class')).toBe(snapshots.class);
    },
};
