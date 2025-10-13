import {
    connectContext,
    disconnectContext,
    addTrustedContext,
    initContext,
} from '../../../../helpers/context';

initContext();

class MockContextSignal {
    connectProvidedComponent;
    disconnectProvidedComponent;
    providedContextSignal;

    constructor(initialValue, contextDefinition, fromContext) {
        this.value = initialValue;
        this.contextDefinition = contextDefinition;
        this.fromContext = fromContext;
        addTrustedContext(this);
    }
    [connectContext](runtimeAdapter) {
        this.connectProvidedComponent = runtimeAdapter.component;

        runtimeAdapter.provideContext(this.contextDefinition, this);

        if (this.fromContext) {
            runtimeAdapter.consumeContext(this.fromContext, (providedContextSignal) => {
                this.providedContextSignal = providedContextSignal;
                this.value = providedContextSignal.value;
            });
        }
    }
    [disconnectContext](component) {
        this.disconnectProvidedComponent = component;
    }
}

// This is a malformed context signal that does not implement the connectContext or disconnectContext methods
class MockMalformedContextSignal {
    constructor() {
        addTrustedContext(this);
    }
}

export const defineContext = (fromContext) => {
    const contextDefinition = (initialValue) =>
        new MockContextSignal(initialValue, contextDefinition, fromContext);
    return contextDefinition;
};

export const defineMalformedContext = () => {
    return () => new MockMalformedContextSignal();
};
