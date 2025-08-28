import { expectConsoleCallsDev } from '../../../../helpers/utils.js';
export default {
    props: {
        isServer: true,
    },
    clientProps: {
        isServer: false,
    },
    snapshot(target) {
        return {
            childMarkup: target.shadowRoot.firstChild.firstChild.shadowRoot.innerHTML,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.childMarkup).not.toBe(snapshots.childMarkup);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration child node mismatch on: <x-child> - rendered on server: <div> - expected on client: <div>,<div>',
                'Hydration completed with errors.',
            ],
        });
    },
};
