import { expectConsoleCallsDev } from '../../../../../helpers/utils.js';

/** @type {import('../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        styles: '',
    },
    clientProps: {
        styles: 'color: burlywood;',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            styles: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe('color: burlywood;');

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: style="" - expected on client: style="color: burlywood;"',
                'Hydration completed with errors.',
            ],
        });
    },
};
