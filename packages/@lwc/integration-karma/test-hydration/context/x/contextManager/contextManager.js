import { setContextKeys, setTrustedContextSet } from 'lwc';

const connectContext = Symbol('connectContext');
const disconnectContext = Symbol('disconnectContext');
const trustedContext = new WeakSet();

setTrustedContextSet(trustedContext);
setContextKeys({ connectContext, disconnectContext });

class MockContextSignal {
    connectProvidedComponent;
    disconnectProvidedComponent;
    providedContextSignal;

    constructor(initialValue, contextDefinition, fromContext) {
        this.value = initialValue;
        this.contextDefinition = contextDefinition;
        this.fromContext = fromContext;
        trustedContext.add(this);
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

export const defineContext = (fromContext) => {
    const contextDefinition = (initialValue) =>
        new MockContextSignal(initialValue, contextDefinition, fromContext);
    return contextDefinition;
};
