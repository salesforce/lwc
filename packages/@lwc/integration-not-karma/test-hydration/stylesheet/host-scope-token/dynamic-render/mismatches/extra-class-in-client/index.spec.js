import { expectConsoleCallsDev } from '../../../../../../helpers/utils.js';

/** @type {import('../../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        clazz: '',
    },
    clientProps: {
        clazz: 'foo',
    },
    snapshot(target) {
        const child = target.shadowRoot.querySelector('c-child');
        return {
            child,
            h1: child.shadowRoot.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const child = target.shadowRoot.querySelector('c-child');
        const h1 = child.shadowRoot.querySelector('h1');
        expect(child).not.toBe(snapshots.child);
        expect(h1).not.toBe(snapshots.h1);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <c-child> - rendered on server: class="" - expected on client: class="foo"',
                'Hydration completed with errors.',
            ],
        });
    },
};
