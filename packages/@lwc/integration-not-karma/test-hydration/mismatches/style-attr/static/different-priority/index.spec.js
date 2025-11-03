import { expectConsoleCallsDev } from '../../../../../helpers/utils.js';

/** @type {import('../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        ssr: true,
    },
    clientProps: {
        ssr: false,
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).not.toBe(snapshots.style);
        expect(p.getAttribute('style')).toBe(
            'background-color: red; border-color: red !important;'
        );

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: style="background-color: red; border-color: red;" - expected on client: style="background-color: red; border-color: red !important;"',
                'Hydration completed with errors.',
            ],
        });
    },
};
