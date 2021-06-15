import { LightningElement, api } from 'lwc';
import one from './one.html';
import two from './two.html';

export default class extends LightningElement {
    static preferNativeShadow = true;

    _error = null;
    @api tryToRenderSynthetic = false;

    render() {
        return this.tryToRenderSynthetic ? two : one;
    }

    errorCallback(error) {
        this._error = error.message;
    }

    @api get error() {
        return this._error;
    }
}
