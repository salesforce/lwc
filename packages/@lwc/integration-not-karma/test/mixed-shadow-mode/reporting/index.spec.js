import { createElement } from 'lwc';

import Component from 'c/component';
import Parent from 'c/parent';
import Light from 'c/light';
import { jasmine } from '../../../helpers/jasmine.js';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
} from '../../../helpers/reporting-control.js';

// Should be kept in sync with the enum in vm.ts
const ShadowMode = {
    Native: 0,
    Synthetic: 1,
};

describe('ShadowModeUsage', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = jasmine.createSpy();
        attachReportingControlDispatcher(dispatcher, ['ShadowModeUsage']);
    });

    afterEach(() => {
        detachReportingControlDispatcher();
    });

    it('should report the shadow mode for the rendered component', () => {
        const element = createElement('c-component', { is: Component });
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'c-component',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
    });

    it('should report the shadow mode for all rendered components', () => {
        const element = createElement('c-parent', { is: Parent });
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalledTimes(3);
        // c-parent depends on environment
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'c-parent',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
        // c-native should be set to native always
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'c-native',
            mode: ShadowMode.Native,
        });
        // c-component depends on environment
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'c-component',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
    });

    it('should report the shadow mode for components when created using CustomElementConstructor', () => {
        const ParentCustomElement = Parent.CustomElementConstructor;
        customElements.define('c-parent-custom-element', ParentCustomElement);

        const element = document.createElement('c-parent-custom-element');
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalledTimes(3);
        // c-parent depends on environment
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'X-PARENT-CUSTOM-ELEMENT',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
        // c-native should be set to native always
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'c-native',
            mode: ShadowMode.Native,
        });
        // c-component depends on environment
        expect(dispatcher).toHaveBeenCalledWith('ShadowModeUsage', {
            tagName: 'c-component',
            mode: process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic,
        });
    });

    it('should report no shadow mode for light DOM components', () => {
        const element = createElement('c-light', { is: Light });
        document.body.appendChild(element);

        expect(dispatcher).toHaveBeenCalledTimes(0);
    });
});
