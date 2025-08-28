import { expectConsoleCallsDev } from '../../../../helpers/utils.js';
// SSR has `class="null"`, whereas the client has no class at all.
// This is to test if hydration is smart enough to recognize the difference between a null
// attribute and the literal string "null".
export default {
    props: {
        className: 'null',
    },
    clientProps: {
        className: undefined,
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
                'Hydration attribute mismatch on: <p> - rendered on server: class="null" - expected on client: class=""',
                'Hydration completed with errors.',
            ],
        });
    },
};
