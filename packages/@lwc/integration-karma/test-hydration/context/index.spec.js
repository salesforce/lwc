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
    const grandparentContext = snapshot.components.grandparent.context;
    const firstParentContext = snapshot.components.firstParent.context;
    const childOfFirstParentContext = snapshot.components.childOfFirstParent.context;

    expect(childOfFirstParentContext.providedContextSignal)
        .withContext(
            `${snapshot.components.childOfFirstParent.tagName} should have been provided with the parent's context and not that of the grandparent`
        )
        .toBe(firstParentContext);

    expect(firstParentContext.providedContextSignal)
        .withContext(
            `${snapshot.components.firstParent.tagName} should have been provided with the parent's context and not that of the grandparent`
        )
        .toBe(grandparentContext);
}

function assertContextDisconnected(target, snapshot) {
    Object.values(snapshot.components).forEach(
        (component) =>
            (component.disconnect = () => {
                expect(component.context.disconnectProvidedComponent.hostElement)
                    .withContext(
                        `The context of ${component.tagName} should have been disconnected with the correct component`
                    )
                    .toBe(component);
            })
    );
    target.showTree = false;
}
