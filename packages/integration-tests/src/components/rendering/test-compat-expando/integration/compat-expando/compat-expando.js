import { LightningElement, api } from 'lwc';

export default class CompatExpando extends LightningElement {
    state = {};

    @api
    changeComputedText() {
        this.state.computed = this.state.computed ? this.state.computed + '#changed' : 'computed';
    }

    get computed() {
        return this.state.computed || 'undefined-value';
    }
}
