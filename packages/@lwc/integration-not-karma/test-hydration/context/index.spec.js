import { expectConsoleCalls } from '../../helpers/utils.js';

export default {
    // server is expected to generate the same console error as the client
    expectedSSRConsoleCalls: {
        error: [],
        warn: [
            'Attempted to connect to trusted context but received the following error',
            'Multiple contexts of the same variety were provided. Only the first context will be used.',
        ],
    },
    requiredFeatureFlags: ['ENABLE_EXPERIMENTAL_SIGNALS'],
    snapshot(target) {
        const grandparent = target.shadowRoot.querySelector('x-grandparent');
        const detachedChild = target.shadowRoot.querySelector('x-child');
        const firstParent = grandparent.shadowRoot.querySelectorAll('x-parent')[0];
        const secondParent = grandparent.shadowRoot.querySelectorAll('x-parent')[1];
        const childOfFirstParent = firstParent.shadowRoot.querySelector('x-child');
        const childOfSecondParent = secondParent.shadowRoot.querySelector('x-child');

        return {
            components: {
                grandparent,
                firstParent,
                secondParent,
                childOfFirstParent,
                childOfSecondParent,
            },
            detachedChild,
        };
    },
    test(target, snapshot, consoleCalls) {
        // Assert context is provided by the grandparent and consumed correctly by all children
        assertCorrectContext(snapshot);

        // Assert context is shadowed when consumed in a chain
        assertContextShadowed(snapshot);

        // Assert context is disconnected when components are removed
        assertContextDisconnected(target, snapshot);

        // Legacy SSRv1 does not support context when inherited
        if (!process.env.ENGINE_SERVER) {
            // Expect an error as one context was generated twice.
            // Expect an error as one context was malformed (did not define connectContext or disconnectContext methods).
            // Expect server/client context output parity (no hydration warnings)
            expectConsoleCalls(consoleCalls, {
                error: [],
                warn: [
                    'Attempted to connect to trusted context but received the following error',
                    'Multiple contexts of the same variety were provided. Only the first context will be used.',
                ],
            });
        }
    },
};

function assertCorrectContext(snapshot) {
    Object.values(snapshot.components).forEach((component) => {
        expect(component.shadowRoot.querySelector('div').textContent)
            .withContext(`${component.tagName} should have the correct context`)
            .toBe('grandparent provided value, another grandparent provided value');

        expect(component.context.connectProvidedComponent?.hostElement)
            .withContext(
                `The context of ${component.tagName} should have been connected with the correct component`
            )
            .toBe(component);
    });
    expect(snapshot.detachedChild.shadowRoot.querySelector('div').textContent).toBe(', ');
}

function assertContextShadowed(snapshot) {
    const grandparentContext = snapshot.components.grandparent.context;
    const firstParentContext = snapshot.components.firstParent.context;
    const childOfFirstParentContext = snapshot.components.childOfFirstParent.context;

    expect(childOfFirstParentContext.providedContextSignal)
        .withContext(
            `Child should have been provided with the parent context and not that of the grandparent (grandparent context was shadowed)`
        )
        .toBe(firstParentContext);

    expect(firstParentContext.providedContextSignal)
        .withContext(`Parent should have been provided with grandparent context`)
        .toBe(grandparentContext);

    // For good measure
    expect(grandparentContext)
        .withContext(`Grandparent context should not be the same as the parent context`)
        .not.toBe(firstParentContext);
}

function assertContextDisconnected(target, snapshot) {
    Object.values(snapshot.components).forEach(
        (component) =>
            (component.disconnect = () => {
                expect(component.context.disconnectProvidedComponent?.hostElement)
                    .withContext(
                        `The context of ${component.tagName} should have been disconnected with the correct component`
                    )
                    .toBe(component);
            })
    );
    target.showTree = false;
}
