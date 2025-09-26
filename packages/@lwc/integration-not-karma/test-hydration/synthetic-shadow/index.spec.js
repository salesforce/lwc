export default {
    props: {},
    snapshot(target) {
        const parentP = target.shadowRoot.querySelector('p');
        const childP = target.shadowRoot.querySelector('x-child').shadowRoot.querySelector('p');
        return {
            parentP,
            childP,
        };
    },
    test(target, snapshots, consoleCalls) {
        const parentP = target.shadowRoot.querySelector('p');
        const child = target.shadowRoot.querySelector('x-child');
        const childP = child.shadowRoot.querySelector('p');
        expect(parentP).toBe(snapshots.parentP);
        expect(childP).toBe(snapshots.childP);
        expect(parentP.textContent).toBe('Parent');
        expect(childP.textContent).toBe('Child');

        // both should be native no matter what
        expect(target.shadowRoot.synthetic).toBeUndefined();
        expect(child.shadowRoot.synthetic).toBeUndefined();

        // sanity check that the env var is working
        if (process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION) {
            expect(document.body.attachShadow.toString()).not.toContain('[native code');
        } else {
            expect(document.body.attachShadow.toString()).toContain('[native code');
        }

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
