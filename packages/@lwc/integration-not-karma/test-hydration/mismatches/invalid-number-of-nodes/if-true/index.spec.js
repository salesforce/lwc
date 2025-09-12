import { expectConsoleCallsDev } from '../../../../helpers/utils.js';

export default {
    props: {
        showBlue: true,
    },
    clientProps: {
        showBlue: false,
    },
    snapshot(target) {
        return {
            text: target.shadowRoot.firstChild.innerText,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.text).not.toBe(snapshots.text);

        if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
            expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration text content mismatch on: #text - rendered on server: blue - expected on client: green',
                    'Hydration child node mismatch on: <ul> - rendered on server: <li>,<li>,<li> - expected on client: <li>,,<li>',
                    'Hydration completed with errors.',
                ],
            });
        } else {
            expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration child node mismatch on: <ul> - rendered on server: <li>,<li>,<li> - expected on client: <li>,,<li>',
                    'Hydration completed with errors.',
                ],
            });
        }
    },
};
