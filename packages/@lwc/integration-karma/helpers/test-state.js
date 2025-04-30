window.TestState = (function (lwc) {
    const connectContext = Symbol('connectContext');
    const disconnectContext = Symbol('disconnectContext');
    const contextEventKey = Symbol('contextEventKey');

    const contextKeys = {
        connectContext,
        disconnectContext,
        contextEventKey,
    };

    lwc.setContextKeys(contextKeys);

    const defineContext = (fromContext) => {
        const contextDefinition = (initialValue) => {
            class MockContextSignal {
                constructor(initialValue) {
                    this.value = initialValue;
                }
                [connectContext](runtimeAdapter) {
                    runtimeAdapter.provideContext(contextDefinition, this);
                    if (fromContext) {
                        runtimeAdapter.consumeContext(
                            fromContext,
                            (providedContextSignal) => this.value = providedContextSignal.value
                        );
                    }
                }
                [disconnectContext]() {
                    this.disconnectContextCalled = true;
                }
            }
            return new MockContextSignal(initialValue);
        };
        return contextDefinition;
    }

    return {
        defineContext
    };
})(window.LWC, window.TestUtils);
