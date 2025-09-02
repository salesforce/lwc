export default {
    props: {
        greeting: 'hello!',
    },
    clientProps: {
        greeting: 'bye!',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            text: p.firstChild,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.firstChild).toBe(snapshots.text);
        expect(p.textContent).toBe('bye!');
        if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration text content mismatch on: #text - rendered on server: hello! - expected on client: bye!',
                ],
            });
        } else {
            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration text content mismatch on: <p> - rendered on server: hello! - expected on client: bye!',
                ],
            });
        }
    },
};
