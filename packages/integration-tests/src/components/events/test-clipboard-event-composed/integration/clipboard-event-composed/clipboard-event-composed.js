import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api
    didHandleCopy() {
        return this._didHandleCopy || false;
    }
    @api
    didHandleCut() {
        return this._didHandleCut || false;
    }
    @api
    didHandlePaste() {
        return this._didHandlePaste || false;
    }

    handleCopy() {
        this._didHandleCopy = true;
    }
    handleCut() {
        this._didHandleCut = true;
    }
    handlePaste() {
        this._didHandlePaste = true;
    }
}
