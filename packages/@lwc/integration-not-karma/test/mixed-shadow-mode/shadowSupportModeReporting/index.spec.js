import { createElement } from 'lwc';

import Any from 'c/any';
import Reset from 'c/reset';
import None from 'c/none';
import NativeOnly from 'c/native';
import { jasmine } from '../../../helpers/jasmine.js';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
} from '../../../helpers/reporting-control.js';

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
            createElement('c-any', { is: Any });
        }).toLogWarningDev(/Invalid value 'any' for static property shadowSupportMode/);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledWith('ShadowSupportModeUsage', {
            tagName: Any.name,
            mode: 'any',
        });
    });

    it('should report use of value "native"', () => {
        createElement('c-native', { is: NativeOnly });

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledWith('ShadowSupportModeUsage', {
            tagName: NativeOnly.name,
            mode: 'native',
        });
    });

    it('should not report use of value "reset"', () => {
        createElement('c-reset', { is: Reset });

        expect(dispatcher).toHaveBeenCalledTimes(0);
    });

    it('should not report when no value is provided', () => {
        createElement('c-none', { is: None });

        expect(dispatcher).toHaveBeenCalledTimes(0);
    });
});
