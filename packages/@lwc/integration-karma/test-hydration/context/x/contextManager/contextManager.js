import { setContextKeys, setTrustedContextSet } from 'lwc';

const connectContext = Symbol('connectContext');
const disconnectContext = Symbol('disconnectContext');
const trustedContext = new WeakSet();

setTrustedContextSet(trustedContext);
setContextKeys({ connectContext, disconnectContext });

class MockSignal {
    subscribers = new Set();

    constructor(initialValue) {
        this._value = initialValue;
    }

    set value(newValue) {
        this._value = newValue;
        this.notify();
    }

    get value() {
        return this._value;
    }

    subscribe(onUpdate) {
        this.subscribers.add(onUpdate);
    }

    notify() {
        for (const subscriber of this.subscribers) {
            subscriber(this.value);
        }
    }
}

class MockContextSignal {
    disconnectContextCalled = false;

    constructor(initialValue, contextDefinition, fromContext) {
        this.value = new MockSignal(initialValue);
        this.contextDefinition = contextDefinition;
        this.fromContext = fromContext;
        trustedContext.add(this);
    }
    [connectContext](runtimeAdapter) {
        runtimeAdapter.provideContext(this.contextDefinition, this);
        if (this.fromContext) {
            runtimeAdapter.consumeContext(this.fromContext, (providedContextSignal) => {
                this.value.value = providedContextSignal.value.value;
                providedContextSignal.value.subscribe(
                    (updatedValue) => (this.value.value = updatedValue)
                );
            });
        }
    }
    [disconnectContext]() {
        this.disconnectContextCalled = true;
    }
}

export const defineContext = (fromContext) => {
    const contextDefinition = (initialValue) =>
        new MockContextSignal(initialValue, contextDefinition, fromContext);
    return contextDefinition;
};
