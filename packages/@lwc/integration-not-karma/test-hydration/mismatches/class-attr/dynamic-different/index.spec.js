import { expectConsoleCallsDev } from '../../../../helpers/utils.js';

/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        classes: 'c1 c2 c3',
    },
    clientProps: {
        classes: 'c2 c3 c4',
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

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: class="c1 c2 c3" - expected on client: class="c2 c3 c4"',
                'Hydration completed with errors.',
            ],
        });
    },
};
