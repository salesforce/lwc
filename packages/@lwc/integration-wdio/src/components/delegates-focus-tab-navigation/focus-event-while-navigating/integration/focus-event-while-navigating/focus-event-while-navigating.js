import { LightningElement, api, track } from 'lwc';

export default class Container extends LightningElement {
    @track
    _hostFocusCount = 0;

    @track
    _shadowFocusCount = 0;

    @api
    reset() {
        this._hostFocusCount = 0;
        this._shadowFocusCount = 0;
    }

    @api
    hostFocusCount() {
        return this._hostFocusCount;
    }
    @api
    shadowFocusCount() {
        return this._shadowFocusCount;
    }

    get renderedHostFocusCount() {
        return this._hostFocusCount;
    }
    get renderedShadowFocusCount() {
        return this._shadowFocusCount;
    }

    handleHostFocus() {
        this._hostFocusCount += 1;
    }
    handleShadowFocus() {
        this._shadowFocusCount += 1;
    }
}
