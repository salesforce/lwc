import { expectConsoleCallsDev } from '../../../../helpers/utils.js';

// SSR has no class at all, whereas the client has `class="null"`.
// This is to test if hydration is smart enough to recognize the difference between a null
// attribute and the literal string "null".
export default {
    props: {
        className: '',
    },
    clientProps: {
        className: 'null',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            className: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);
        expect(p.className).not.toBe(snapshots.className);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: class="" - expected on client: class="null"',
                'Hydration completed with errors.',
            ],
        });
    },
};
