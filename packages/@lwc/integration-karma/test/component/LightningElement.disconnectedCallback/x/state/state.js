/* eslint-disable */
/**
 * This file is generated from repository: git+https://github.com/salesforce/lightning-labs.git
 * module: packages/@lwc/state
 */

import { getContextKeys } from 'test-utils';

// node_modules/@lwc/signals/dist/index.js
function isFalse$1(value, msg) {
    if (value) {
        throw new Error(`Assert Violation: ${msg}`);
    }
}
var trustedSignals;
function setTrustedSignalSet(signals) {
    isFalse$1(trustedSignals, 'Trusted Signal Set is already set!');
    trustedSignals = signals;
}
function addTrustedSignal(signal) {
    trustedSignals?.add(signal);
}
var SignalBaseClass = class {
    constructor() {
        this.subscribers = /* @__PURE__ */ new Set();
        addTrustedSignal(this);
    }
    subscribe(onUpdate) {
        this.subscribers.add(onUpdate);
        return () => {
            this.subscribers.delete(onUpdate);
        };
    }
    notify() {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }
};

// src/shared.ts
var connectContext = getContextKeys().connectContext;
var disconnectContext = getContextKeys().disconnectContext;

// src/standalone-context.ts
var ConsumedContextSignal = class extends SignalBaseClass {
    constructor(stateDef) {
        super();
        this._value = null;
        this.unsubscribe = () => {};
        this.desiredStateDef = stateDef;
    }
    get value() {
        return this._value;
    }
    [connectContext](runtimeAdapter) {
        if (!runtimeAdapter) {
            throw new Error(
                'Implementation error: runtimeAdapter must be present at the time of connect.'
            );
        }
        runtimeAdapter.consumeContext(this.desiredStateDef, (providedContextSignal) => {
            this._value = providedContextSignal.value;
            this.notify();
            this.unsubscribe = providedContextSignal.subscribe(() => {
                this._value = providedContextSignal.value;
                this.notify();
            });
        });
    }
    [disconnectContext](_componentId) {
        this.unsubscribe();
        this.unsubscribe = () => {};
    }
};

// src/index.ts
var atomSetter = Symbol('atomSetter');
var contextID = Symbol('contextID');
var AtomSignal = class extends SignalBaseClass {
    constructor(value) {
        super();
        this._value = value;
    }
    [atomSetter](value) {
        this._value = value;
        this.notify();
    }
    get value() {
        return this._value;
    }
};
var ContextAtomSignal = class extends AtomSignal {
    constructor() {
        super(...arguments);
        this._id = contextID;
    }
};
var ComputedSignal = class extends SignalBaseClass {
    constructor(inputSignalsObj, computer) {
        super();
        this.isStale = true;
        this.computer = computer;
        this.dependencies = inputSignalsObj;
        const onUpdate = () => {
            this.isStale = true;
            this.notify();
        };
        for (const signal of Object.values(inputSignalsObj)) {
            signal.subscribe(onUpdate);
        }
    }
    computeValue() {
        const dependencyValues = {};
        for (const [signalName, signal] of Object.entries(this.dependencies)) {
            dependencyValues[signalName] = signal.value;
        }
        this.isStale = false;
        this._value = this.computer(dependencyValues);
    }
    notify() {
        this.isStale = true;
        super.notify();
    }
    get value() {
        if (this.isStale) {
            this.computeValue();
        }
        return this._value;
    }
};
var isUpdater = (signalOrUpdater) => typeof signalOrUpdater === 'function';
var atom = (initialValue) => new AtomSignal(initialValue);
var computed = (inputSignalsObj, computer) => new ComputedSignal(inputSignalsObj, computer);
var update = (signalsToUpdate, userProvidedUpdaterFn) => {
    return (...uniqueArgs) => {
        const signalValues = {};
        for (const [signalName, signal] of Object.entries(signalsToUpdate)) {
            signalValues[signalName] = signal.value;
        }
        const newValues = userProvidedUpdaterFn(signalValues, ...uniqueArgs);
        for (const [atomName, newValue] of Object.entries(newValues)) {
            signalsToUpdate[atomName][atomSetter](newValue);
        }
    };
};
var defineState = (defineStateCallback) => {
    const stateDefinition = (...args) => {
        class StateManagerSignal extends SignalBaseClass {
            constructor() {
                super();
                this.isStale = true;
                this.isNotifyScheduled = false;
                // biome-ignore lint/suspicious/noExplicitAny: we actually do want this, thanks
                this.contextSignals = /* @__PURE__ */ new Map();
                this.contextConsumptionQueue = [];
                this.contextUnsubscribes = /* @__PURE__ */ new WeakMap();
                const fromContext2 = (contextVarietyUniqueId) => {
                    if (this.contextSignals.has(contextVarietyUniqueId)) {
                        return this.contextSignals.get(contextVarietyUniqueId);
                    }
                    const localContextSignal = new ContextAtomSignal(void 0);
                    this.contextSignals.set(contextVarietyUniqueId, localContextSignal);
                    this.contextConsumptionQueue.push((runtimeAdapter) => {
                        if (!runtimeAdapter) {
                            throw new Error(
                                'Implementation error: runtimeAdapter must be present at the time of connect.'
                            );
                        }
                        runtimeAdapter.consumeContext(
                            contextVarietyUniqueId,
                            (providedContextSignal) => {
                                localContextSignal[atomSetter](providedContextSignal.value);
                                const unsub = providedContextSignal.subscribe(() => {
                                    localContextSignal[atomSetter](providedContextSignal.value);
                                });
                                if (!this.contextUnsubscribes.has(runtimeAdapter.component)) {
                                    this.contextUnsubscribes.set(runtimeAdapter.component, []);
                                }
                                this.contextUnsubscribes.get(runtimeAdapter.component).push(unsub);
                            }
                        );
                    });
                    return localContextSignal;
                };
                this.internalStateShape = defineStateCallback(
                    atom,
                    computed,
                    update,
                    fromContext2
                )(...args);
                for (const signalOrUpdater of Object.values(this.internalStateShape)) {
                    if (signalOrUpdater && !isUpdater(signalOrUpdater)) {
                        signalOrUpdater.subscribe(this.scheduledNotify.bind(this));
                    }
                }
            }
            [connectContext](runtimeAdapter) {
                runtimeAdapter.provideContext(stateDefinition, this);
                for (const connectContext2 of this.contextConsumptionQueue) {
                    connectContext2(runtimeAdapter);
                }
            }
            [disconnectContext](componentId) {
                const unsubArray = this.contextUnsubscribes.get(componentId);
                if (!unsubArray) {
                    return;
                }
                while (unsubArray.length !== 0) {
                    unsubArray.pop()();
                }
            }
            shareableContext() {
                const contextAtom = new ContextAtomSignal(void 0);
                const updateContextAtom = () => {
                    const valueWithUpdaters = this.value;
                    const filteredValue = Object.fromEntries(
                        Object.entries(valueWithUpdaters).filter(
                            ([, valueOrUpdater]) => !isUpdater(valueOrUpdater)
                        )
                    );
                    contextAtom[atomSetter](Object.freeze(filteredValue));
                };
                updateContextAtom();
                this.subscribe(updateContextAtom);
                return contextAtom;
            }
            computeValue() {
                const computedValue = Object.fromEntries(
                    Object.entries(this.internalStateShape)
                        .filter(([, signalOrUpdater]) => signalOrUpdater)
                        .map(([key, signalOrUpdater]) => {
                            if (isUpdater(signalOrUpdater) || signalOrUpdater._id === contextID) {
                                return [key, signalOrUpdater];
                            }
                            return [key, signalOrUpdater.value];
                        })
                );
                this._value = Object.freeze(computedValue);
                this.isStale = false;
            }
            scheduledNotify() {
                this.isStale = true;
                if (!this.isNotifyScheduled) {
                    queueMicrotask(() => {
                        this.isNotifyScheduled = false;
                        super.notify();
                    });
                    this.isNotifyScheduled = true;
                }
            }
            get value() {
                if (this.isStale) {
                    this.computeValue();
                }
                return this._value;
            }
        }
        return new StateManagerSignal();
    };
    return stateDefinition;
};

// src/contextful-lwc.ts

// src/event.ts
var contextEventKey = getContextKeys().contextEventKey;
var EVENT_NAME = 'lightning:context-request';
var ContextRequestEvent = class extends CustomEvent {
    constructor(detail) {
        super(EVENT_NAME, {
            bubbles: true,
            composed: true,
            detail: { ...detail, key: contextEventKey },
        });
    }
};

const nameStateFactory = defineState(
    (atom, computed, update, fromContext) =>
        (initialName = 'foo') => {
            const name = atom(initialName);

            const updateName = update({ name }, (_, newName) => ({
                name: newName,
            }));

            return {
                name,
                updateName,
            };
        }
);

const consumeStateFactory = defineState(
    (atom, computed, update, fromContext) =>
        (initialName = 'bar') => {
            const name = atom(initialName);
            const context = fromContext(nameStateFactory);

            const updateName = update({ name }, (_, newName) => ({
                name: newName,
            }));

            return {
                name,
                updateName,
                context,
            };
        }
);

export { defineState, nameStateFactory, consumeStateFactory };
/* @lwc/state v0.4.2 */
