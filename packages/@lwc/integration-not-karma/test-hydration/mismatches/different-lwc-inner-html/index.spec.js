import { expectConsoleCallsDev } from '../../../helpers/utils.js';

export default {
    props: {
        content: '<p>test-content</p>',
    },
    clientProps: {
        content: '<p>different-content</p>',
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        const p = div.querySelector('p');
        return {
            div,
            p,
        };
    },
    async test(target, snapshot, consoleCalls) {
        const div = target.shadowRoot.querySelector('div');
        const p = div.querySelector('p');

        expect(div).toBe(snapshot.div);
        expect(p).not.toBe(snapshot.p);
        expect(p.textContent).toBe('different-content');

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration innerHTML mismatch on: <div> - rendered on server: <p>test-content</p> - expected on client: <p>different-content</p>',
            ],
        });

        target.content = '<p>another-content</p>';

        await Promise.resolve();
        expect(div.textContent).toBe('another-content');
    },
};
