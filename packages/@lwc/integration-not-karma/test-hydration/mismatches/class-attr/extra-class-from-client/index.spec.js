import { expectConsoleCallsDev } from '../../../../helpers/utils.js';

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
            classes: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);
        expect(p.className).not.toBe(snapshots.classes);
        expect(p.className).toBe('c1 c2 c3');

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: class="c1 c3" - expected on client: class="c1 c2 c3"',
                'Hydration completed with errors.',
            ],
        });
    },
};
