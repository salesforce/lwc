import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';
import { Signal } from 'x/signal';
import { spyOn } from '@vitest/spy';

const createElementSignalAndInsertIntoDom = async (object) => {
    const elm = createElement('x-test', { is: Test });
    elm.object = object;
    document.body.appendChild(elm);
    await Promise.resolve();
    return elm;
};

describe('signal reaction in lwc', () => {
    let consoleSpy;

    beforeAll(() => setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', true));
    afterAll(() => setFeatureFlagForTest('ENABLE_EXPERIMENTAL_SIGNALS', false));
    beforeEach(() => {
        consoleSpy = spyOn(console, 'warn');
    });
    afterEach(() => consoleSpy.mockRestore());

    describe('with trusted signal set', () => {
        describe('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION is enabled', () => {
            beforeAll(() => setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true));
            afterAll(() => setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false));
            it('will not warn if rendering non-signal objects ', async () => {
                const elm = await createElementSignalAndInsertIntoDom({
                    value: 'non signal value',
                });
                expect(consoleSpy).not.toHaveBeenCalled();
                expect(elm.shadowRoot.textContent).toBe('non signal value');
            });
            it('will not warn if rendering signal objects', async () => {
                const signal = new Signal('signal value');
                const elm = await createElementSignalAndInsertIntoDom(signal);
                expect(consoleSpy).not.toHaveBeenCalled();
                signal.value = 'new signal value';
                await Promise.resolve();
                expect(elm.shadowRoot.textContent).toBe('new signal value');
            });
        });

        describe('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION is disabled', () => {
            beforeAll(() =>
                setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false)
            );
            it('will not warn if rendering non-signal objects', async () => {
                const elm = await createElementSignalAndInsertIntoDom({
                    value: 'non signal value',
                });
                expect(consoleSpy).not.toHaveBeenCalled();
                expect(elm.shadowRoot.textContent).toBe('non signal value');
            });
            it('will not warn if rendering signal objects', async () => {
                const signal = new Signal('signal value');
                const elm = await createElementSignalAndInsertIntoDom(signal);
                expect(consoleSpy).not.toHaveBeenCalled();
                signal.value = 'new signal value';
                await Promise.resolve();
                expect(elm.shadowRoot.textContent).toBe('new signal value');
            });
        });
    });

    describe('without trusted signal set', () => {
        beforeAll(() => globalThis.__lwcResetTrustedSignals());
        describe('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION is enabled', () => {
            beforeAll(() => setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true));
            afterAll(() => setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false));
            /**
             * The legacy validation behavior was that this check should only
             * be performed for runtimes that have provided a trustedSignals set.
             * However, this resulted in a bug as all object values were
             * being considered signals in environments where the trustedSignals
             * set had not been defined. The runtime flag has been added as a killswitch
             * in case the fix needs to be reverted.
             */
            it('will warn if rendering non-signal objects ', async () => {
                const elm = await createElementSignalAndInsertIntoDom({
                    value: 'non signal value',
                });
                expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
                expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
                    expect.objectContaining({
                        message: expect.stringContaining(
                            'Attempted to subscribe to an object that has the shape of a signal but received the following error: TypeError: signal.subscribe is not a function'
                        ),
                    })
                );
                expect(elm.shadowRoot.textContent).toBe('non signal value');
            });
            it('will not warn if rendering signal objects', async () => {
                const signal = new Signal('signal value');
                const elm = await createElementSignalAndInsertIntoDom(signal);
                expect(consoleSpy).not.toHaveBeenCalled();
                signal.value = 'new signal value';
                await Promise.resolve();
                expect(elm.shadowRoot.textContent).toBe('new signal value');
            });
        });

        describe('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION is disabled', () => {
            beforeAll(() =>
                setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false)
            );
            it('will not warn if rendering non-signal objects', async () => {
                const elm = await createElementSignalAndInsertIntoDom({
                    value: 'non signal value',
                });
                expect(consoleSpy).not.toHaveBeenCalled();
                expect(elm.shadowRoot.textContent).toBe('non signal value');
            });
            /**
             * Signals are designed to be used where trustedSignalSet has been defined via setTrustedSignalSet
             * This is because checking against the set is an efficient way to determine if an object is a Signal
             * This is acceptable as Signals is an internal API and designed to work where setTrustedSignalSet has been used.
             * Because of this, the signal value does not change here.
             * See #5347 for context.
             */
            it('will not warn if rendering signal objects but it will not react', async () => {
                const signal = new Signal('signal value');
                const elm = await createElementSignalAndInsertIntoDom(signal);
                expect(consoleSpy).not.toHaveBeenCalled();
                signal.value = 'new signal value';
                await Promise.resolve();
                expect(elm.shadowRoot.textContent).toBe('signal value');
            });
        });
    });
});
