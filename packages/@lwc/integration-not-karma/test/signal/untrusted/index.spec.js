import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';
import { Signal } from 'x/signal';
import { spyOn } from '@vitest/spy';
import { resetTrustedSignals } from '../../../helpers/reset';

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
        beforeAll(resetTrustedSignals);
        describe('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION is enabled', () => {
            beforeAll(() => setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', true));
            afterAll(() => setFeatureFlagForTest('ENABLE_LEGACY_SIGNAL_CONTEXT_VALIDATION', false));

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
        });
    });
});
