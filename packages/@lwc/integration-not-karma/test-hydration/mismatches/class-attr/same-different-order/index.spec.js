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

        // TODO [#4656]: static optimization causes mismatches for style/class only when ordering is different
        if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
            expect(p).toBe(snapshots.p);
            expect(p.className).toBe(snapshots.classes);

            expect(consoleCalls.warn).toHaveSize(0);
        } else {
            expect(p).not.toBe(snapshots.p);
            expect(p.className).toBe('c1 c2 c3');

            expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration attribute mismatch on: <p> - rendered on server: class="c3 c2 c1" - expected on client: class="c1 c2 c3"',
                    'Hydration completed with errors.',
                ],
            });
        }
    },
};
