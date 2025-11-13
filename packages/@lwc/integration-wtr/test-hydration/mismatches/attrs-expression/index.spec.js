import { expectConsoleCallsDev } from '../../../helpers/utils.js';

/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        foo: 'server',
    },
    clientProps: {
        foo: 'client',
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        return {
            div,
        };
    },
    test(target, snapshots, consoleCalls) {
        const div = target.shadowRoot.querySelector('div');
        expect(div).not.toBe(snapshots.div);
        expect(div.getAttribute('data-foo')).toBe('client');
        expect(div.getAttribute('data-static')).toBe('same-value');

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <div> - rendered on server: data-foo="server" - expected on client: data-foo="client"',
                'Hydration completed with errors.',
            ],
        });
    },
};
