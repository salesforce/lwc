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
        // Assert context is provided by the grandparent and consumed correctly by all children
        assertCorrectContext(snapshot);

        // Assert context is shadowed when changed
        assertContextShadowed(snapshot);

        // Assert context is disconnected when components are removed
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

function assertCorrectContext(snapshot) {
    Object.values(snapshot.components).forEach((component) => {
        expect(component.shadowRoot.querySelector('div').textContent)
            .withContext(`${component.tagName} should have the correct context`)
            .toBe('grandparent provided value, another grandparent provided value');

        expect(component.context.connectProvidedComponent.hostElement)
            .withContext(
                `The context of ${component.tagName} should have been connected with the correct component`
            )
            .toBe(component);
    });
    expect(snapshot.detachedChild.shadowRoot.querySelector('div').textContent).toBe(', ');
}

function assertContextShadowed(snapshot) {
    // Change the parents context value and then check to make sure the grandparents value has been shadowed
    snapshot.components.firstParent.context.value.value = 'shadow value';

    Object.entries(snapshot.components).forEach(([key, component]) => {
        if (key === 'firstParent' || key === 'childOfFirstParent') {
            expect(component.context.value.value)
                .withContext(`${component.tagName} should have the correct context after shadowing`)
                .toBe('shadow value');
        } else {
            expect(component.context.value.value)
                .withContext(`${component.tagName} should have the initial context after shadowing`)
                .toBe('grandparent provided value');
        }
    });
}

function assertContextDisconnected(target, snapshot) {
    Object.values(snapshot.components).forEach(
        (component) =>
            (component.disconnect = () => {
                expect(component.context.disconnectContextCalled)
                    .withContext(`${component.tagName} should have disconnected the context`)
                    .toBeTrue();

                expect(component.context.disconnectProvidedComponent)
                    .withContext(
                        `The context of ${component.tagName} should have been disconnected with the correct component`
                    )
                    .toBe(component.context.connectProvidedComponent);
            })
    );
    target.showTree = false;
}
