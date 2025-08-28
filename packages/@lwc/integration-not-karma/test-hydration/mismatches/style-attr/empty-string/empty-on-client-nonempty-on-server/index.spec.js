import { expectConsoleCallsDev } from '../../../../../helpers/utils.js';
export default {
    props: {
        styles: 'color: burlywood;',
    },
    clientProps: {
        styles: '',
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
        expect(p.getAttribute('style')).toBe(null);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: style="color: burlywood;" - expected on client: style=""',
                'Hydration completed with errors.',
            ],
        });
    },
};
