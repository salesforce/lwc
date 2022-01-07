export default {
    snapshot(target) {
        const lightChild = target.shadowRoot.querySelector('[data-id="x-light-child"]');

        return {
            lightParent: target,
            parentText: target.shadowRoot.querySelector('[data-id="parent-text"]'),
            shadowChild: lightChild,
            childText: lightChild.querySelector('[data-id="child-text"]'),
        };
    },
    test(target, snapshots) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.lightParent).toBe(snapshots.lightParent);
        expect(hydratedSnapshot.parentText).toBe(snapshots.parentText);
        expect(hydratedSnapshot.shadowChild).toBe(snapshots.shadowChild);
        expect(hydratedSnapshot.childText).toBe(snapshots.childText);

        expect(hydratedSnapshot.parentText.textContent).toEqual('inside parent');
        expect(hydratedSnapshot.childText.textContent).toEqual('inside child');
    },
};
