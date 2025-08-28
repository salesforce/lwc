import { expectConsoleCallsDev } from '../../../helpers/utils.js';
export default {
    props: {
        classes: 'ssr-class',
        styles: 'background-color: red;',
        attrs: 'ssr-attrs',
    },
    clientProps: {
        classes: 'client-class',
        styles: 'background-color: blue;',
        attrs: 'client-attrs',
    },
    snapshot(target) {
        return {
            p: target.shadowRoot.querySelector('p'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);

        expect(p.className).toBe('client-class');
        expect(p.getAttribute('style')).toBe('background-color: blue;');
        expect(p.getAttribute('data-attrs')).toBe('client-attrs');

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <p> - rendered on server: data-attrs="ssr-attrs" - expected on client: data-attrs="client-attrs"',
                'Hydration attribute mismatch on: <p> - rendered on server: class="ssr-class" - expected on client: class="client-class"',
                'Hydration attribute mismatch on: <p> - rendered on server: style="background-color: red;" - expected on client: style="background-color: blue;"',
                'Hydration completed with errors.',
            ],
        });
    },
};
