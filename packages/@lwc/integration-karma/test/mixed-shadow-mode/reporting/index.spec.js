import { createElement, __unstable__ReportingControl as reportingControl } from 'lwc';

import Component from 'x/component';
import Parent from 'x/parent';

// Should be kept in sync with the enum in vm.ts
const ShadowMode = {
    Native: 0,
    Synthetic: 1,
};

describe('', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = jasmine.createSpy();
        reportingControl.attachDispatcher(dispatcher);
    });

    afterEach(() => {
        reportingControl.detachDispatcher();
    });

    it('should report the shadow mode for the rendered component', () => {
        const element = createElement('x-component', { is: Component });
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'x-component',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
    });

    it('should report the shadow mode for all rendered components', () => {
        const element = createElement('x-parent', { is: Parent });
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalledTimes(3);
        // x-parent depends on environment
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'x-parent',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
        // x-native should be set to native always
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'x-native',
            mode: ShadowMode.Native,
        });
        // x-component depends on environment
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'x-component',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
    });
});
