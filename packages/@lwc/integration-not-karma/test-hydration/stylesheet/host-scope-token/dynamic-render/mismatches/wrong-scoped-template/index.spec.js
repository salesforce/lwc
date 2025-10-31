import { expectConsoleCallsDev } from '../../../../../../helpers/utils.js';

/** @type {import('../../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        showA: false,
    },
    clientProps: {
        showA: true,
    },
    snapshot(target) {
        const child = target.shadowRoot.querySelector('c-child');
        return {
            child,
            classList: new Set([...child.classList]),
            h1: child.shadowRoot.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const child = target.shadowRoot.querySelector('c-child');
        const h1 = child.shadowRoot.querySelector('h1');

        // <c-child> is not considered mismatched but its children are
        expect(child).toBe(snapshots.child);
        expect(h1).not.toBe(snapshots.h1);

        expect(
            getComputedStyle(child).getPropertyValue('--from-template').trim().replace(/"/g, "'")
        ).toBe("'a'");

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <style> - rendered on server: class="lwc-7qfdo66i6mp" - expected on client: class="lwc-2kgvov93avb"',
                'Hydration attribute mismatch on: <h1> - rendered on server: class="lwc-7qfdo66i6mp" - expected on client: class="lwc-2kgvov93avb"',
                'Hydration completed with errors.',
            ],
        });
    },
};
