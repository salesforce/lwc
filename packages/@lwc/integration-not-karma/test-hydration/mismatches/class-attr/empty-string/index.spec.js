import { expectConsoleCallsDev } from '../../../../helpers/utils.js';
export default {
    props: {
        classes: '',
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
        expect(p).toBe(snapshots.p);
        expect(p.className).toBe(snapshots.classes);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [],
        });
    },
};
