import { createElement } from 'lwc';
import { attachReportingControlDispatcher, detachReportingControlDispatcher } from 'test-utils';

import Any from 'x/any';
import Reset from 'x/reset';
import None from 'x/none';
import NativeOnly from 'x/native';

// Should be kept in sync with the enum in vm.ts
const ShadowSupportMode = {
    Any: 'any',
    Default: 'reset',
    Native: 'native',
};

/**
 * These tests must be the first ones to generate the component def for the components they use.
 * This is because subsequent calls to create the component will use the cached ctor rather than
 * recreating the entire def. We only report on that initial def creation for perf reasons.
 */
describe('shadow support mode reporting', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = jasmine.createSpy();
        attachReportingControlDispatcher(dispatcher, ['ShadowSupportModeUsage']);
    });

    afterEach(() => {
        detachReportingControlDispatcher();
    });

    it('should report use of value "any"', () => {
        expect(() => {
            createElement('x-any', { is: Any });
        }).toLogWarningDev(/Invalid value 'any' for static property shadowSupportMode/);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledWith('ShadowSupportModeUsage', {
            tagName: Any.name,
            mode: ShadowSupportMode.Any,
        });
    });

    it('should report use of value "native"', () => {
        createElement('x-native', { is: NativeOnly });

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledWith('ShadowSupportModeUsage', {
            tagName: NativeOnly.name,
            mode: ShadowSupportMode.Native,
        });
    });

    it('should not report use of value "reset"', () => {
        createElement('x-reset', { is: Reset });

        expect(dispatcher).toHaveBeenCalledTimes(0);
    });

    it('should not report when no value is provided', () => {
        createElement('x-none', { is: None });

        expect(dispatcher).toHaveBeenCalledTimes(0);
    });
});
