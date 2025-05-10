export default {
    // server is expected to generate the same console error as the client
    expectedSSRConsoleCalls: {
        error: [
            'Multiple contexts of the same variety were provided. Only the first context will be used.',
        ],
        warn: [],
    },
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
        assertCorrectContext(
            snapshot,
            'grandparent provided value, another grandparent provided value'
        );
        assertContextShadowed(snapshot, 'grandparent provided value', 'shadow value');
        assertContextDisconnected(target, snapshot);
        // Expect an error as one context was generated twice. Expect no hydration warnings.
        TestUtils.expectConsoleCalls(consoleCalls, {
            error: [
                'Multiple contexts of the same variety were provided. Only the first context will be used.',
            ],
            warn: [],
        });
    },
};

function assertCorrectContext(snapshot, expectedContext) {
    // Assert the provided context is correct
    Object.values(snapshot.components).forEach((component) => {
        expect(component.shadowRoot.querySelector('div').textContent)
            .withContext(`${component.tagName} should have the correct context`)
            .toBe(expectedContext);
    });
    expect(snapshot.detachedChild.shadowRoot.querySelector('div').textContent).toBe(', ');
}

function assertContextShadowed(snapshot, expectedInitialContext, shadowContext) {
    // Assert context is correct after shadowing
    snapshot.components.firstParent.context.value.value = shadowContext;
    Object.entries(snapshot.components).forEach(([key, component]) => {
        if (key === 'firstParent' || key === 'childOfFirstParent') {
            expect(component.context.value.value)
                .withContext(`${component.tagName} should have the correct context after shadowing`)
                .toBe(shadowContext);
        } else {
            expect(component.context.value.value)
                .withContext(`${component.tagName} should have the initial context after shadowing`)
                .toBe(expectedInitialContext);
        }
    });
}

function assertContextDisconnected(target, snapshot) {
    // Assert context is disconnected
    Object.values(snapshot.components).forEach(
        (component) =>
            (component.disconnect = () => {
                expect(component.context.disconnectContextCalled)
                    .withContext(`${component.tagName} should have disconnected the context`)
                    .toBeTrue();
            })
    );
    target.showTree = false;
}
